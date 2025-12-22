#!/bin/bash

# Build, deploy, and invalidate all CloudFront distributions
# This script builds the dashboard, deploys to S3, and invalidates
# both the main distribution and all whitelabel distributions.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
REGION="${AWS_REGION:-us-east-1}"

# Main distribution
MAIN_DISTRIBUTION_ID="E1SF0LCLYQI9CH"
S3_BUCKET="zl-dashboard"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Z2 Dashboard Build & Deploy${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Change to project directory
cd "$PROJECT_DIR"

# Step 1: Build
echo -e "${YELLOW}[1/4] Building dashboard...${NC}"
npm run build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Step 2: Deploy to S3
echo -e "${YELLOW}[2/4] Deploying to S3...${NC}"
aws s3 sync dist "s3://${S3_BUCKET}"
echo -e "${GREEN}✓ Deploy complete${NC}"
echo ""

# Step 3: Invalidate main distribution
echo -e "${YELLOW}[3/4] Invalidating main CloudFront distribution...${NC}"
MAIN_INVALIDATION=$(aws cloudfront create-invalidation \
  --distribution-id "$MAIN_DISTRIBUTION_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text 2>&1)

if [[ $? -eq 0 ]]; then
  echo -e "${GREEN}✓ Main invalidation created: ${MAIN_INVALIDATION}${NC}"
else
  echo -e "${RED}✗ Main invalidation failed: ${MAIN_INVALIDATION}${NC}"
  exit 1
fi
echo ""

# Step 4: Invalidate all whitelabel distributions
echo -e "${YELLOW}[4/4] Invalidating all whitelabel distributions...${NC}"
echo ""

# Get all stacks with wl- prefix that are in a valid state
STACKS=$(aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query "StackSummaries[?starts_with(StackName, 'wl-')].StackName" \
  --output text \
  --region "$REGION" 2>/dev/null || echo "")

if [[ -z "$STACKS" ]]; then
  echo -e "${YELLOW}No whitelabel stacks found.${NC}"
else
  # Convert to array
  STACK_ARRAY=($STACKS)
  TOTAL=${#STACK_ARRAY[@]}

  echo -e "${GREEN}Found ${TOTAL} whitelabel stack(s)${NC}"
  echo ""

  # Track results
  SUCCESS_COUNT=0
  SKIP_COUNT=0
  FAIL_COUNT=0

  for STACK_NAME in "${STACK_ARRAY[@]}"; do
    echo -e "${BLUE}Processing: ${STACK_NAME}${NC}"

    # Get the CloudFront distribution ID from stack outputs
    DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
      --stack-name "$STACK_NAME" \
      --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
      --output text \
      --region "$REGION" 2>/dev/null || echo "")

    if [[ -z "$DISTRIBUTION_ID" || "$DISTRIBUTION_ID" == "None" ]]; then
      echo -e "  ${YELLOW}⚠ No distribution found (Step < 3?)${NC}"
      ((SKIP_COUNT++))
      continue
    fi

    echo -e "  Distribution: ${GREEN}${DISTRIBUTION_ID}${NC}"

    # Create invalidation
    INVALIDATION_RESULT=$(aws cloudfront create-invalidation \
      --distribution-id "$DISTRIBUTION_ID" \
      --paths "/*" \
      --query 'Invalidation.Id' \
      --output text 2>&1)

    if [[ $? -eq 0 ]]; then
      echo -e "  ${GREEN}✓ Invalidation created: ${INVALIDATION_RESULT}${NC}"
      ((SUCCESS_COUNT++))
    else
      echo -e "  ${RED}✗ Failed: ${INVALIDATION_RESULT}${NC}"
      ((FAIL_COUNT++))
    fi

    echo ""
  done

  # WL Summary
  echo -e "${BLUE}Whitelabel Summary:${NC}"
  echo -e "  ${GREEN}Successful:${NC} ${SUCCESS_COUNT}"
  echo -e "  ${YELLOW}Skipped:${NC}    ${SKIP_COUNT}"
  echo -e "  ${RED}Failed:${NC}     ${FAIL_COUNT}"
  echo ""
fi

echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}  All done!${NC}"
echo -e "${BLUE}============================================${NC}"
