import { useState } from "react";
import { Routes, Route, useLocation } from "react-router";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Plans from "./components/Plans";
import CheckoutForm from "./components/CheckoutForm";
import CheckoutRedirect from "./redirect/index";

const PLANS = [
  {
    key: "basic",
    title: "Individual Basic",
    type: "individual",
    description: "Ideal for Small Teams and Sales Professionals",
    prices: [
      {
        price: 197,
        lookupKey: "price_individual_basic_monthly",
        interval: "monthly",
      },
      {
        price: 157,
        lookupKey: "price_individual_basic_quarterly",
        interval: "quarterly",
      },
    ],
  },
  {
    key: "professional",
    title: "Individual Pro",
    type: "individual",
    description: "Perfect for Entrepreneurs and Small Businesses",
    prices: [
      {
        price: 297,
        lookupKey: "price_individual_pro_monthly",
        interval: "monthly",
      },
      {
        price: 237,
        lookupKey: "price_individual_pro_quarterly",
        interval: "quarterly",
      },
    ],
  },
  {
    key: "agencyBasic",
    title: "Agency and Enterprise Basic",
    type: "agency",
    description:
      "A robust automation solution for Agencies & Large Businesses",
    prices: [
      {
        price: 156,
        lookupKey: "price_agency_basic_monthly",
        interval: "monthly",
      },
      {
        price: 125,
        lookupKey: "price_agency_basic_quarterly",
        interval: "quarterly",
      },
    ],
    fee: 997,
  },
  {
    key: "agencyPro",
    title: "Agency and Enterprise Pro",
    type: "agency",
    description:
      "A fully AI-powered revenue generator for Agencies & Enterprises",
    prices: [
      {
        price: 237,
        lookupKey: "price_agency_pro_monthly",
        interval: "monthly",
      },
      {
        price: 190,
        lookupKey: "price_agency_pro_quarterly",
        interval: "quarterly",
      },
    ],
    fee: 997,
  },
];

const stripePromise = loadStripe(
  "pk_test_51RkiUpGbzOYrUpsJAQ1x6G74FGIStBGDERkePRTZwASQMBlv9i17N4Qbe5V0guNmNLvV5Igc2xXe9UMHmnVHGZfu00l882p30f",
); // TODO: Replace with your real key

function Checkout() {
  const location = useLocation();
  const [planLookupKey, setPlanLookupKey] = useState(() => {
    const initialPlanLookupKey = new URLSearchParams(location.search).get(
      "plan",
    );
    if (
      !initialPlanLookupKey ||
      !PLANS.find(p =>
        p.prices.some(price => price.lookupKey === initialPlanLookupKey),
      )
    ) {
      return PLANS[0].prices[0].lookupKey;
    }

    return initialPlanLookupKey;
  });
  const [coupon, setCoupon] = useState(null);
  const [usersCount, setUsersCount] = useState(2);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center 2xl:px-60 2xl:py-20">
      <div className="w-full max-w-8xl bg-white 2xl:rounded-lg 2xl:shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex lg:flex-row lg:items-start">
          <div className="lg:basis-[50%] bg-stone-900 w-full">
            <Plans
              plans={PLANS}
              planLookupKey={planLookupKey}
              setPlanLookupKey={setPlanLookupKey}
              coupon={coupon}
              usersCount={usersCount}
              setUsersCount={setUsersCount}
            />
          </div>
          <div className="lg:basis-[50%]">
            <CheckoutForm
              plans={PLANS}
              planLookupKey={planLookupKey}
              coupon={coupon}
              setCoupon={setCoupon}
              usersCount={usersCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function () {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "subscription",
        amount: 297,
        currency: "usd",
        setup_future_usage: "off_session",
        payment_method_types: ["card"],
      }}
    >
      <Routes>
        <Route path="/" element={<Checkout />} />
        <Route path="/redirect" element={<CheckoutRedirect />} />
      </Routes>
    </Elements>
  );
}
