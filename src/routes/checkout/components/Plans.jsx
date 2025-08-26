import { useEffect, useState } from "react";
import logo from "../../../assets/black_logo.png";
import ToggleSwitch from "../../../components/ToggleSwitch";
import Card from "./Card";

export default function Plans({
  plans,
  planLookupKey,
  setPlanLookupKey,
  coupon,
  usersCount,
  setUsersCount,
}) {
  const [device, setDevice] = useState("desktop");
  const [centerIndex, setCenterIndex] = useState(() => {
    if (planLookupKey) {
      return plans.findIndex(p =>
        p.prices.some(price => price.lookupKey === planLookupKey),
      );
    } else {
      return 0;
    }
  });
  const [interval, setInterval] = useState(() => {
    if (planLookupKey.includes("monthly")) return "monthly";
    else return "quarterly";
  });
  const [isPremiumSelected, setIsPremiumSelected] = useState(true);
  const [showPremiumAgencyFeatures, setShowPremiumAgencyFeatures] =
    useState(true);
  const [showBasicFeatures, setShowBasicFeatures] = useState(true);

  const plan = plans.find(p =>
    p.prices.some(price => price.lookupKey === planLookupKey),
  );

  const price = plan.prices.find(p => p.interval === interval).price;

  useEffect(() => {
    setPlanLookupKey(plan.prices.find(p => p.interval === interval).lookupKey);
  }, [interval]);

  // Calculate plan total
  let planTotal = 0;
  if (plan.type === "agency") {
    planTotal = price * usersCount * (interval === "monthly" ? 1 : 3);
  } else {
    planTotal = price * (interval === "monthly" ? 1 : 3);
  }

  if (plan.type === "agency" && isPremiumSelected) {
    planTotal += plan.fee;
  }

  let discountedTotal = planTotal;
  if (coupon) {
    if (coupon.percent_off)
      discountedTotal = planTotal * (1 - coupon.percent_off / 100);
    else if (coupon.amount_off)
      discountedTotal = planTotal - coupon.amount_off / 100;
  }

  const getPositionStyle = index => {
    // Calculate relative position more smoothly
    const relativeIndex = (index - centerIndex + plans.length) % plans.length;

    // Device-specific positioning configurations
    const configs = {
      tinyMobile: {
        center: { x: 0, y: 50, scale: 1, opacity: 1, zIndex: 30 },
        left: { x: -95, y: 25, scale: 0.85, opacity: 0.6, zIndex: 20 },
        back: { x: 0, y: 0, scale: 0.8, opacity: 0.2, zIndex: 10 },
        right: { x: 75, y: 25, scale: 0.85, opacity: 0.6, zIndex: 20 },
      },
      mobile: {
        center: { x: 0, y: 60, scale: 1, opacity: 1, zIndex: 30 },
        left: { x: -99, y: 30, scale: 0.85, opacity: 0.6, zIndex: 20 },
        back: { x: 0, y: 0, scale: 0.8, opacity: 0.2, zIndex: 10 },
        right: { x: 99, y: 30, scale: 0.85, opacity: 0.6, zIndex: 20 },
      },
      smallTablet: {
        center: { x: 0, y: 75, scale: 1, opacity: 1, zIndex: 30 },
        left: { x: -180, y: 35, scale: 0.85, opacity: 0.6, zIndex: 20 },
        back: { x: 0, y: 0, scale: 0.8, opacity: 0.2, zIndex: 10 },
        right: { x: 185, y: 35, scale: 0.85, opacity: 0.6, zIndex: 20 },
      },
      tablet: {
        center: { x: 0, y: 80, scale: 1, opacity: 1, zIndex: 30 },
        left: { x: -125, y: 40, scale: 0.85, opacity: 0.6, zIndex: 20 },
        back: { x: 0, y: 0, scale: 0.8, opacity: 0.2, zIndex: 10 },
        right: { x: 135, y: 40, scale: 0.85, opacity: 0.6, zIndex: 20 },
      },
      desktop: {
        center: { x: 0, y: 80, scale: 1, opacity: 1, zIndex: 30 },
        left: { x: -195, y: 40, scale: 0.85, opacity: 0.6, zIndex: 20 },
        back: { x: 0, y: 0, scale: 0.8, opacity: 0.2, zIndex: 10 },
        right: { x: 195, y: 40, scale: 0.85, opacity: 0.6, zIndex: 20 },
      },
    };

    const config = configs[device];
    let position;

    switch (relativeIndex) {
      case 0:
        position = config.center;
        break;
      case 1:
        position = config.left;
        break;
      case 2:
        position = config.back;
        break;
      case 3:
        position = config.right;
        break;
      default:
        position = config.back;
    }

    return {
      transform: `translate(calc(-50% + ${position.x}px), ${position.y}px) scale(${position.scale})`,
      opacity: position.opacity,
      zIndex: position.zIndex,
      left: "50%",
      top: "0px",
    };
  };

  const handleCardClick = index => {
    const relativeIndex = (index - centerIndex + plans.length) % plans.length;

    // Only allow clicking on side cards (left and right)
    if (relativeIndex === 1) {
      // Left card clicked → move cards to the right (increment center index)
      setCenterIndex(prev => (prev + 1) % plans.length);

      // Update the planLookupKey with the selected price's lookupKey
      setPlanLookupKey(
        plans[index].prices.find(p => p.interval === interval).lookupKey,
      );
    } else if (relativeIndex === 3) {
      // Right card clicked → move cards to the left (decrement center index)
      setCenterIndex(prev => (prev - 1 + plans.length) % plans.length);

      // Update the planLookupKey with the selected price's lookupKey
      setPlanLookupKey(
        plans[index].prices.find(p => p.interval === interval).lookupKey,
      );
    }
  };

  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      if (width <= 399) setDevice("tinyMobile");
      else if (width <= 599) setDevice("mobile");
      else if (width <= 920) setDevice("smallTablet");
      else if (width <= 1024) setDevice("tablet");
      else setDevice("desktop");
    };

    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  return (
    <div className="flex flex-col pl-[4px] pr-[3px] sm:pl-[20px] sm:pr-[15px] md:pl-[60px] md:pr-[33px] lg:pl-[40px] lg:pr-[20px] xl:pl-[60px] xl:pr-[33px] py-6 gap-y-12">
      <div className="flex flex-col gap-y-6">
        <img src={logo} alt="logo" className="w-[140px]" />
        <div className="flex flex-col gap-y-[16px] ml-[10px] sm:ml-0">
          <h1 className="text-white text-[25px] md:text-[40px] font-medium lg:text-[35px]">
            Scale Your Omnichannel Outreach
          </h1>
          <div>
            <p className="text-sm md:text-[16px] font-normal text-white lg:text-sm xl:text-[16px] max-w-[600px] leading-relaxed">
              Open your Zeekeo Launchpad account within minutes to start
              opening conversations with your ideal target audience
            </p>
          </div>
        </div>
      </div>

      <div className="border-1 p-3 sm:border-2 border-white  md:p-5 lg:p-1 xl:p-5 flex flex-col gap-y-[30px] items-start justify-start w-full">
        <div className="flex items-center justify-end float-right w-full">
          <ToggleSwitch
            leftChecked={interval === "monthly"}
            onChange={() =>
              setInterval(interval === "monthly" ? "quarterly" : "monthly")
            }
            leftText="Monthly"
            rightText="Quarterly"
          />
        </div>
        <div className="relative w-full h-[220px] sm:h-[330px] flex items-center justify-center overflow-visible">
          {plans.map((plan, idx) => (
            <Card
              key={idx}
              plan={plan}
              price={plan.prices.find(p => p.interval === interval).price}
              style={{
                ...getPositionStyle(idx),
                position: "absolute",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                transformOrigin: "center center",
              }}
              onClick={() => handleCardClick(idx)}
            />
          ))}
        </div>

        <div className="flex flex-col items-start w-full gap-2">
          <div className="ml-auto flex flex-col items-start gap-2">
            <p className="text-[14px] font-normal text-white">
              Subscription Renews On:
            </p>
            <div className="text-[14px] w-[130px] h-[30px] font-normal text-black bg-white md:h-[40px] md:w-[240px] flex items-center justify-center">
              <p className="text-center">
                {(() => {
                  const date = new Date();
                  date.setMonth(
                    date.getMonth() + (interval === "monthly" ? 1 : 3),
                  );
                  return date
                    .toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    .replace(",", ",");
                })()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-5 md:gap-y-0 md:flex-row md:justify-between text-white w-full ">
          {/* Features Section */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col gap-y-4">
              <h2 className="font-normal text-sm">Includes Basic, plus:</h2>
              <ul className="space-y-[5px] list-none font-normal text-xs">
                {[
                  "End-to-End AI Campaign Builder",
                  "AI Template Map Library",
                  "AI-Generated Responses",
                  "AI Sentiment Analysis",
                  "AI LinkedIn Post Scheduling",
                  "AI Customer Personas",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <BlueCheck />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-y-4">
              <div
                className="flex items-center gap-x-[15px]"
                onClick={() =>
                  setShowPremiumAgencyFeatures(!showPremiumAgencyFeatures)
                }
              >
                <h2 className="font-normal text-sm">
                  Premium Agency Option ($997 one-time fee)
                </h2>
                <svg
                  width="10"
                  height="8"
                  viewBox="0 0 10 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-300 ${
                    showPremiumAgencyFeatures ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <path
                    d="M9.943 0.768C9.90056 0.687222 9.83687 0.619568 9.7588 0.572338C9.68073 0.525108 9.59124 0.500095 9.5 0.5H0.499999C0.408921 0.500376 0.319668 0.525573 0.241839 0.572881C0.16401 0.62019 0.10055 0.687819 0.0582832 0.768497C0.0160162 0.849174 -0.00345847 0.939848 0.00195351 1.03077C0.00736549 1.12168 0.0374594 1.20941 0.0889988 1.2845L4.589 7.7845C4.63487 7.85112 4.69625 7.90559 4.76784 7.94322C4.83944 7.98085 4.91911 8.00052 5 8.00052C5.08088 8.00052 5.16056 7.98085 5.23215 7.94322C5.30375 7.90559 5.36513 7.85112 5.411 7.7845L9.911 1.2845C9.96304 1.20956 9.99354 1.12179 9.99919 1.03072C10.0048 0.939659 9.98539 0.848791 9.943 0.768ZM5 6.6215L1.454 1.5H8.546L5 6.6215Z"
                    fill="white"
                  />
                </svg>
              </div>
              {showPremiumAgencyFeatures && (
                <ul className="space-y-[5px] list-none font-normal text-xs">
                  {[
                    "Full White-Label",
                    "Global Inbox",
                    "Global Templates",
                    "Global Blacklist",
                    "Custom JavaScript Settings",
                    "Sub-Agencies",
                    "DNS Setup",
                    "API Access",
                    "Deduplication Groupings",
                    "Parallel LinkedIn Viewer",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <BlueCheck />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-y-4">
              <div
                className="flex items-center gap-x-[15px]"
                onClick={() => setShowBasicFeatures(!showBasicFeatures)}
              >
                <h2 className="font-normal text-sm">Basic Features</h2>
                <svg
                  width="10"
                  height="8"
                  viewBox="0 0 10 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-300 ${
                    showBasicFeatures ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <path
                    d="M9.943 0.768C9.90056 0.687222 9.83687 0.619568 9.7588 0.572338C9.68073 0.525108 9.59124 0.500095 9.5 0.5H0.499999C0.408921 0.500376 0.319668 0.525573 0.241839 0.572881C0.16401 0.62019 0.10055 0.687819 0.0582832 0.768497C0.0160162 0.849174 -0.00345847 0.939848 0.00195351 1.03077C0.00736549 1.12168 0.0374594 1.20941 0.0889988 1.2845L4.589 7.7845C4.63487 7.85112 4.69625 7.90559 4.76784 7.94322C4.83944 7.98085 4.91911 8.00052 5 8.00052C5.08088 8.00052 5.16056 7.98085 5.23215 7.94322C5.30375 7.90559 5.36513 7.85112 5.411 7.7845L9.911 1.2845C9.96304 1.20956 9.99354 1.12179 9.99919 1.03072C10.0048 0.939659 9.98539 0.848791 9.943 0.768ZM5 6.6215L1.454 1.5H8.546L5 6.6215Z"
                    fill="white"
                  />
                </svg>
              </div>
              {showBasicFeatures && (
                <div className="flex flex-col items-start">
                  <ul className="space-y-[5px] list-none font-normal text-xs">
                    {[
                      "Full White-Label",
                      "Global Inbox",
                      "Global Templates",
                      "Global Blacklist",
                      "Custom JavaScript Settings",
                      "Sub-Agencies",
                      "DNS Setup",
                      "API Access",
                      "Deduplication Groupings",
                      "Parallel LinkedIn Viewer",
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <BlueCheck />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="w-full h-fit md:w-[240px] xl:w-[240px] bg-white text-black py-4 px-[18px] flex flex-col md:gap-y-4">
            <div className="flex flex-col gap-y-[10px]">
              <div className="text-xs font-normal">
                ${price} /{" "}
                {plan.type === "individual" ? "Month" : "User / Month"}
              </div>

              {plan.type === "agency" && (
                <div className="flex items-center gap-x-4">
                  <span className="text-xs font-normal">Number of Users:</span>
                  <input
                    type="number"
                    min={2}
                    className="w-16 border border-gray-300 p-1 rounded"
                    value={usersCount}
                    onChange={e => {
                      if (Number(e.target.value) < 2) {
                        setUsersCount(2);
                      } else {
                        setUsersCount(Number(e.target.value));
                      }
                    }}
                  />
                </div>
              )}

              {plan.type === "agency" && (
                <div className="text-xs font-normal">
                  SubTotal: ${price * (interval === "monthly" ? 1 : 3)} X{" "}
                  {usersCount} Users = $
                  {price * usersCount * (interval === "monthly" ? 1 : 3)}{" "}
                  Billed {interval === "monthly" ? "Monthly" : "Quarterly"}
                </div>
              )}

              {plan.type === "agency" && (
                <div>
                  <div className="text-xs font-normal">
                    Premium Agency: ${plan.fee}
                  </div>
                  <p className="text-xs font-normal">One-Time Fee</p>

                  <label className="flex items-center gap-2 text-xs font-normal">
                    <input
                      type="checkbox"
                      checked={isPremiumSelected}
                      className="border border-gray-300"
                      onChange={() => setIsPremiumSelected(!isPremiumSelected)}
                    />
                    Include Premium Agency
                  </label>
                </div>
              )}
            </div>

            <hr />

            <div className="text-sm font-semibold text-center bg-stone-900 text-white h-6 flex items-center justify-center">
              Total:{" "}
              {coupon ? (
                <>
                  <span className="line-through italic">${planTotal}</span>{" "}
                  {discountedTotal}
                </>
              ) : (
                `$${planTotal}`
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlueCheck() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 16.4443C9.53416 16.4443 10.5582 16.2374 11.5136 15.8354C12.4691 15.4333 13.3372 14.8441 14.0685 14.1012C14.7997 13.3583 15.3798 12.4764 15.7756 11.5058C16.1713 10.5352 16.375 9.49491 16.375 8.44434C16.375 7.39376 16.1713 6.35347 15.7756 5.38287C15.3798 4.41226 14.7997 3.53035 14.0685 2.78748C13.3372 2.04461 12.4691 1.45534 11.5136 1.0533C10.5582 0.651262 9.53416 0.444336 8.5 0.444336C6.41142 0.444336 4.40838 1.28719 2.93153 2.78748C1.45469 4.28777 0.625 6.3226 0.625 8.44434C0.625 10.5661 1.45469 12.6009 2.93153 14.1012C4.40838 15.6015 6.41142 16.4443 8.5 16.4443ZM8.297 11.6799L12.672 6.34656L11.328 5.20878L7.5655 9.79456L5.61862 7.81589L4.38138 9.07278L7.00638 11.7394L7.68363 12.4274L8.297 11.6799Z"
        fill="#0387FF"
      />
    </svg>
  );
}
