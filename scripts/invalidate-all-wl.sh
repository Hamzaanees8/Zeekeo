#!/bin/bash

# Invalidate all whitelabel CloudFront distributions
# This script finds all CloudFormation stacks with "wl-" prefix,
# extracts the CloudFront distribution ID from each, and creates
# an invalidation for /* on each distribution.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REGION="${AWS_REGION:-us-east-1}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Invalidating All Whitelabel CDNs${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Get all stacks with wl- prefix that are in a valid state
echo -e "${YELLOW}Finding whitelabel stacks...${NC}"
STACKS=$(aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query "StackSummaries[?starts_with(StackName, 'wl-')].StackName" \
  --output text \
  --region "$REGION" 2>/dev/null || echo "")

if [[ -z "$STACKS" ]]; then
  echo -e "${RED}No whitelabel stacks found.${NC}"
  exit 0
fi

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

# Summary
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "  ${GREEN}Successful:${NC} ${SUCCESS_COUNT}"
echo -e "  ${YELLOW}Skipped:${NC}    ${SKIP_COUNT}"
echo -e "  ${RED}Failed:${NC}     ${FAIL_COUNT}"
echo ""

if [[ $FAIL_COUNT -gt 0 ]]; then
  exit 1
fi
