import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useStripe } from "@stripe/react-stripe-js";
import CheckoutSuccess from "./components/CheckoutSuccess";
import CheckoutError from "./components/CheckoutError";

// Main component
export default function CheckoutRedirect() {
  const stripe = useStripe();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    (async () => {
      if (!stripe) return;

      // Check URL parameters for Stripe redirect status
      const paymentIntentClientSecret = searchParams.get(
        "payment_intent_client_secret",
      );

      if (paymentIntentClientSecret) {
        const data = await stripe.retrievePaymentIntent(
          paymentIntentClientSecret,
        );

        setStatus(data.paymentIntent.status);
      } else {
        setStatus("error");
      }
    })();
  }, [searchParams, stripe]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#1E1D1D] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#0387FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  } else if (status === "succeeded") {
    return <CheckoutSuccess />;
  } else {
    return <CheckoutError error={status} />;
  }
}
