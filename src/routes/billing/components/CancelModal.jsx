import { useEffect, useState } from "react";
import { Pause } from "../../../components/Icons";
import "../index.css";
import {
  CancelSubscription,
  GetActiveSubscription,
  PauseSubscription,
} from "../../../services/billings";
import toast from "react-hot-toast";
const cancellationReasons = [
  "Price",
  "Lack of Features",
  "Issues with LinkedIn",
  "Not Seeing ROI",
  "Lack of Customer Support",
  "Lack of Bandwidth to Manage Campaigns/Leads",
  "Using Another Platform/Lead Gen Channel",
  "Other (please specify)",
  "Price",
];
const CancelModal = ({ onClose }) => {
  const [billingDate, setBillingDate] = useState("");
  const [pauseMonths, setPauseMonths] = useState(1);
  const [showCancel, setShowCancel] = useState(true);
  const [showPause, setShowPause] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFeedBack, setShowFeedBack] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState([]);

  const handleToggle = reason => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };
  useEffect(() => {
    const fetchBillingDate = async () => {
      const data = await GetActiveSubscription();
      setBillingDate(data?.items?.data?.[0]?.current_period_end || 0);
    };
    fetchBillingDate();
  }, []);
  const formatUnixTimestamp = timestamp => {
    const date = new Date(timestamp * 1000);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date
      .toLocaleDateString("en-GB", options)
      .replace(/(\d{2} \w{3}) (\d{4})/, "$1, $2");
  };

  const getResumeDate = (timestamp, months) => {
    const date = new Date(timestamp * 1000);
    date.setMonth(date.getMonth() + months);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date
      .toLocaleDateString("en-GB", options)
      .replace(/(\d{2} \w{3}) (\d{4})/, "$1, $2");
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[570px] px-7 pt-[15px] pb-[28px]">
        <div className="flex justify-between items-start mb-[21px]">
          {showCancel && (
            <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
              Cancel Subscription
            </h2>
          )}
          {showPause && (
            <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
              Before you cancel, did you know you can pause?
            </h2>
          )}
          {showOffer && (
            <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
              We’d like to offer you a 35% discount!
            </h2>
          )}
          {showConfirm && (
            <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
              Sorry, Almost There!
            </h2>
          )}
          {showFeedBack && (
            <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
              Can you please let us know why you are canceling?
            </h2>
          )}
          {showDuration && (
            <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
              Choose Pause Duration
            </h2>
          )}
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>
        {showCancel && (
          <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
            Are you sure you would like to cancel your subscription and close
            your account? This will erase all the data associated with your
            account once your subscription expires
          </p>
        )}
        {showPause && (
          <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
            Would you like to pause instead?
          </p>
        )}
        {showOffer && (
          <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
            Let’s give this another shot. Continue with Zopto at 35% off for
            the next 3-months
          </p>
        )}
        {showConfirm && (
          <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
            Cancelling will delete all of your data. Would you like to go on a
            maintenance plan for $15 a month?
          </p>
        )}
        {showDuration && (
          <>
            <div className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
              <p>
                {pauseMonths} Month{pauseMonths > 1 ? "s" : ""}
              </p>
              <p>
                Billing Resumes on {getResumeDate(billingDate, pauseMonths)}
              </p>
            </div>
            <>
              <input
                min="1"
                max="12"
                value={pauseMonths}
                type="range"
                className="custom-range"
                onChange={e => setPauseMonths(Number(e.target.value))}
              />
            </>

            <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[14px]">
              Your membership will pause after{" "}
              {formatUnixTimestamp(billingDate)}, at the end of your billing
              cycle
            </p>
            <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
              During your pause period, we will retain all your campaign data
              and settings. While you can also resume the subscription at any
              time, your subscription will also resume automatically at the end
              of the pause period, unless you chose to cancel and delete your
              account before that.
            </p>
          </>
        )}
        {showConfirm && (
          <div className="bg-[#7E7E7E] px-[12.5px] py-[6px] h-[34px] cursor-pointer mb-[21px]">
            <p className="text-[#FFFFFF]  font-[500] font-urbanist text-[16px]">
              Yes, please downgrade me to a maintenance plan and keep my data
            </p>
          </div>
        )}
        {showFeedBack && (
          <div className="mb-[21px]">
            {cancellationReasons.map((feature, index) => (
              <div
                key={index}
                className="grid gap-x-[20px] items-center mb-[21px]"
                style={{ gridTemplateColumns: "20px auto" }}
              >
                <input
                  type="checkbox"
                  checked={selectedReasons.includes(feature)}
                  onChange={() => handleToggle(feature)}
                  className="w-[18px] h-[18px] accent-[#0387FF]"
                />

                <p className="text-[16px] font-normal text-[#6D6D6D]">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        )}
        {showCancel && (
          <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
            <button
              onClick={onClose}
              className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => {
                setShowPause(true);
                setShowCancel(false);
              }}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E]"
            >
              Cancel Subscription
            </button>
          </div>
        )}
        {showPause && (
          <div className="flex justify-end gap-x-[25px] font-medium text-base font-urbanist">
            <button
              onClick={() => {
                setShowPause(false);
                setShowOffer(true);
              }}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E]"
            >
              Cancel Subscription
            </button>
            <button
              onClick={() => {
                setShowPause(false);
                setShowDuration(true);
              }}
              className="px-4 py-1 text-[#04479C] border border-[#04479C] bg-white cursor-pointer flex items-center gap-x-2.5"
            >
              <Pause />
              Pause Subscription
            </button>
          </div>
        )}
        {showDuration && (
          <div className="flex justify-between font-medium text-base font-urbanist">
            <button
              onClick={() => {
                setShowPause(true);
                setShowDuration(false);
              }}
              className="w-[175px] px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E]"
            >
              Back
            </button>
            <button
              onClick={async () => {
                try {
                  const result = await PauseSubscription(
                    pauseMonths,
                    billingDate,
                  );
                  if (result) {
                    toast.success("Subscription paused successfully!");
                    setShowDuration(false);
                    onClose();
                  } else {
                    toast.error("Failed to pause subscription!");
                  }
                } catch (error) {
                  toast.error("Something went wrong. Please try again.");
                }
              }}
              className="px-4 py-1 text-[#04479C] border border-[#04479C] bg-white cursor-pointer flex items-center gap-x-2.5"
            >
              <Pause />
              Pause Subscription
            </button>
          </div>
        )}
        {showOffer && (
          <div className="flex justify-end gap-x-[25px] font-medium text-base font-urbanist">
            <button
              onClick={() => {
                setShowOffer(false);
                setShowConfirm(true);
              }}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E]"
            >
              Cancel Subscription
            </button>
            <button
              onClick={() => {
                setShowOffer(false);
                onClose();
              }}
              className="px-4 py-1 text-[#04479C] border border-[#04479C] bg-white cursor-pointer w-[170px]"
            >
              35% Off
            </button>
          </div>
        )}
        {showConfirm && (
          <div className="flex justify-center gap-x-[25px] font-medium text-base font-urbanist">
            <button
              onClick={() => {
                setShowConfirm(false);
                setShowFeedBack(true);
              }}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E]"
            >
              I won’t need my data again. Please cancel.
            </button>
          </div>
        )}
        {showFeedBack && (
          <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
            <button
              onClick={() => {
                setShowConfirm(true);
                setShowFeedBack(false);
              }}
              className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer w-[140px]"
            >
              Back
            </button>
            <button
              onClick={async () => {
                try {
                  await CancelSubscription(/*selectedReasons*/);
                  toast.success("Subscription cancelled successfully");
                  setShowFeedBack(false);
                  onClose();
                } catch (error) {
                  toast.error("Error Cancelling Subscription");
                }
              }}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] w-[170px]"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelModal;
