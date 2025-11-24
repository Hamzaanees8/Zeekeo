import { api } from "./api";

export const CreateCheckoutSession = async checkoutData => {
  try {
    const response = await api.post("/billing/checkout", checkoutData);
    return response || null;
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return null;
  }
};

export const ValidatePromotionCode = async promotionCode => {
  try {
    const response = await api.get(`/billing/coupons`, {
      params: { promotionCode },
    });

    return response || null;
  } catch (error) {
    console.error("Failed to validate promotion code:", error);
    return null;
  }
};

export const GetBillingInvoices = async () => {
  try {
    const response = await api.get("/billing/invoices");
    return response;
  } catch (err) {
    console.error("Failed to fetch invoices:", err);
    throw err;
  }
};

export const GetSavedCards = async () => {
  const response = await api.get("/billing/cards");
  return response.cards || null;
};

export const DeleteSavedCard = async cardId => {
  try {
    const response = await api.delete(`/billing/cards`, {
      params: { card_id: cardId },
    });
    return response;
  } catch (error) {
    console.error("Error deleting card:", error);
    throw error;
  }
};

export const GetPlans = async () => {
  const response = await api.get("/plans");
  return response.plans || null;
};

export const GetActiveSubscription = async () => {
  try {
    const response = await api.get("/billing/subscription");
    return response || null;
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return null;
  }
};

export const UpdateSubscriptionPlan = async (plan, seats = 1, premium = false, agencyUsername = null) => {
  try {
    const body = {
      action: "update",
      plan,
      seats,
      premium,
    };

    // Only include agencyUsername if it's provided
    if (agencyUsername) {
      body.agency_username = agencyUsername;
    }

    const response = await api.put("/billing/subscription", body);

    // If response contains sessionToken, it's an agency creation response (login)
    // Return the entire response so the caller can handle login
    if (response.sessionToken) {
      return response;
    }

    return response.subscription || null;
  } catch (error) {
    console.error("Failed to update subscription plan:", error);
    return null;
  }
};

export const UpdateSubscriptionSeats = async seats => {
  try {
    const response = await api.put("/billing/subscription", {
      action: "update",
      seats,
    });

    return response.subscription || null;
  } catch (error) {
    console.error("Failed to update subscription seats:", error);
    return null;
  }
};

export const PauseSubscription = async months => {
  try {
    const response = await api.put("/billing/subscription", {
      action: "pause",
      months,
    });

    return response.subscription || null;
  } catch (error) {
    console.error("Failed to pause subscription:", error);
    return null;
  }
};

export const CancelSubscription = async (/*reasons = []*/) => {
  try {
    const response = await api.put("/billing/subscription", {
      action: "cancel",
      //reasons,
    });

    return response.subscription || null;
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return null;
  }
};
