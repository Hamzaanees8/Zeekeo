import { useEffect, useState } from "react";
import logo from "../../../assets/black_logo.png";
import ToggleSwitch from "../../../components/ToggleSwitch";
import Card from "./Card";
import PlanDetails from "../../../components/checkout/PlanDetails";

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
  const [planIndex, setPlanIndex] = useState(0);

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

    setPlanIndex(index)
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
              Open your Zeekeo Launchpad account within minutes to begin conversations with your ideal target audience
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
          <PlanDetails planType={plans[planIndex].key} />

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