import { useState } from "react";
import { Pause } from "../../../components/Icons";
import "../index.css";
import {
  CancelSubscription,
  GetActiveSubscription,
  PauseSubscription,
} from "../../../services/billings";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
const cancellationReasons = [
  "Price",
  "Lack of Features",
  "Issues with LinkedIn",
  "Not Seeing ROI",
  "Lack of Customer Support",
  "Lack of Bandwidth to Manage Campaigns/Leads",
  "Using Another Platform/Lead Gen Channel",
  "Other",
];
const CancelModal = ({
  onClose,
  setSubscribedPlanId,
  setSubscription,
  subscription,
  isPaused = false,
}) => {
  const [pauseMonths, setPauseMonths] = useState(1);
  const [showCancel, setShowCancel] = useState(true);
  const [showPause, setShowPause] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFeedBack, setShowFeedBack] = useState(false);
  const [showCancleSession, setshowCancleSession] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [showManageSubscription, setManageSubscription] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const navigate = useNavigate();

  const billingDate = subscription?.items?.data?.[0]?.current_period_end || 0;

  const handleToggle = reason => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };
  const formatUnixTimestamp = timestamp => {
    const date = new Date(timestamp * 1000);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date
      .toLocaleDateString("en-GB", options)
      .replace(/(\d{2} \w{3}) (\d{4})/, "$1, $2");
  };

  const getResumeDate = (periodEndTimestamp, months) => {
    const date = new Date(periodEndTimestamp * 1000);
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
      <div
        className={`bg-white  px-7 pt-[15px] pb-[28px] rounded-[8px] shadow-md
        ${showManageSubscription ? "w-[750px]" : "w-[570px]"}
      `}
      >
        <div className="flex justify-between items-start mb-[21px]">
          {showCancel && (
            <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
              Cancel Subscription
            </h2>
          )}
          {showPause && (
            <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
              Are you sure?
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
          {showCancleSession && (
            <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
              Subscription Cancelled
            </h2>
          )}
          {showDuration && (
            <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
              Choose Pause Duration
            </h2>
          )}
          {showManageSubscription && (
            <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
              Manage Subscription
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
        {showPause && !isPaused && (
          <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
            Before you cancel, did you know you can pause your subscription and
            not incur charges while retaining access to your account and its
            features?
          </p>
        )}
        {showPause && isPaused && (
          <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
            Are you sure you would like to cancel your subscription and close
            your account? This will erase all the data associated with your
            account once your subscription expires.
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
        {showCancleSession && (
          <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
            We are sad to see you go, Thank you for using our platform!
          </p>
        )}
        {showDuration && (
          <>
            <div className="text-[#7E7E7E] mb-[21px] font-urbanist text-[16px] font-bold">
              <p>
                {pauseMonths} Month{pauseMonths > 1 ? "s" : ""}
                <span> - </span>
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
        {/* {showConfirm && (
          <div className="bg-[#7E7E7E] px-[12.5px] py-[6px] h-[34px] cursor-pointer mb-[21px]">
            <p className="text-[#FFFFFF]  font-[500] font-urbanist text-[16px]">
              Yes, please downgrade me to a maintenance plan and keep my data
            </p>
          </div>
        )} */}
        {showFeedBack && (
          <div className="mb-[21px]">
            {cancellationReasons.map((feature, index) => (
              <div
                key={index}
                className="grid gap-x-[20px] items-center mb-[12px]"
                style={{ gridTemplateColumns: "20px auto" }}
              >
                <input
                  type="checkbox"
                  checked={selectedReasons.includes(feature)}
                  onChange={() => handleToggle(feature)}
                  className="w-[18px] h-[18px] accent-[#0387FF] border border-[#0387FF] rounded"
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
              className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowPause(true);
                setShowCancel(false);
              }}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] rounded-[4px]"
            >
              Cancel Subscription
            </button>
          </div>
        )}
        {showPause && !isPaused && (
          <div className="flex justify-between gap-x-[25px] font-medium text-base font-urbanist">
            <button
              onClick={() => {
                setShowPause(false);
                setShowOffer(true);
              }}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] order-1 rounded-[4px]"
            >
              Cancel Subscription
            </button>
            <button
              onClick={() => {
                setShowPause(false);
                setShowDuration(true);
              }}
              className="px-4 py-1 text-[#04479C] border border-[#04479C] bg-white cursor-pointer flex items-center gap-x-2.5 rounded-[4px]"
            >
              <Pause />
              Pause Subscription
            </button>
          </div>
        )}
        {showPause && isPaused && (
          <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
            <button
              onClick={onClose}
              className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowPause(false);
                setShowFeedBack(true);
              }}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] rounded-[4px]"
            >
              Cancel Subscription
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
              className="w-[175px] px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] order-1 rounded-[4px]"
            >
              Back
            </button>
            <button
              onClick={async () => {
                setIsPausing(true);
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
                } catch (err) {
                  if (err?.response?.status !== 401) {
                    toast.error("Something went wrong. Please try again.");
                  }
                } finally {
                  setIsPausing(false);
                }
              }}
              disabled={isPausing}
              className={`px-4 py-1 text-[#04479C] border border-[#04479C] bg-white flex items-center gap-x-2.5 rounded-[4px] ${
                isPausing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {isPausing ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-[#04479C]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Pausing...
                </>
              ) : (
                <>
                  <Pause />
                  Pause Subscription
                </>
              )}
            </button>
          </div>
        )}
        {showOffer && (
          <div className="flex justify-between gap-x-[10px] font-medium text-base font-urbanist">
            <button
              onClick={async () => {
                setIsPausing(true);
                try {
                  const result = await PauseSubscription(pauseMonths);
                  if (result) {
                    toast.success("Subscription paused successfully!");
                    setShowDuration(false);
                    onClose();
                  } else {
                    toast.error("Failed to pause subscription!");
                  }
                } catch (err) {
                  if (err?.response?.status !== 401) {
                    toast.error("Something went wrong. Please try again.");
                  }
                } finally {
                  setIsPausing(false);
                }
              }}
              disabled={isPausing}
              className={`px-4 py-1 text-[#04479C] border border-[#04479C] bg-white flex items-center gap-x-2.5 rounded-[4px] ${
                isPausing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {isPausing ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-[#04479C]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Pausing...
                </>
              ) : (
                <>
                  <Pause />
                  Pause Subscription
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowOffer(false);
                setShowConfirm(true);
              }}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] order-1 rounded-[4px]"
            >
              Cancel Subscription
            </button>
            <button
              onClick={() => {
                setShowOffer(false);
                onClose();
              }}
              className="px-4 py-1 text-[#04479C] border border-[#04479C] bg-white cursor-pointer rounded-[4px]"
            >
              35% Off
            </button>
          </div>
        )}
        {showConfirm && (
          <div className="flex justify-between gap-x-[25px] font-medium text-base font-urbanist">
            <button className="px-4 py-1 text-[#04479C] border border-[#04479C] bg-white cursor-pointer flex items-center gap-x-2.5 rounded-[4px]">
              Yes, Maintenance Plan
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setShowFeedBack(true);
              }}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] rounded-[4px]"
            >
              Cancel Subscription
            </button>
          </div>
        )}
        {showFeedBack && (
          <div className="flex justify-end gap-4 font-medium text-base font-urbanist">
            {/* <button
              onClick={() => {
                setShowConfirm(true);
                setShowFeedBack(false);
              }}
              className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer w-[140px]"
            >
              Back
            </button> */}
            <button
              onClick={async () => {
                try {
                  await CancelSubscription(/*selectedReasons*/);
                  toast.success("Subscription cancelled successfully");
                  const data = await GetActiveSubscription();
                  setSubscription(data);
                  setSubscribedPlanId(
                    data?.subscription?.items?.data[0]?.price?.lookup_key,
                  );
                  setShowFeedBack(false);
                  setshowCancleSession(true);
                  // onClose();
                } catch (err) {
                  if (err?.response?.status !== 401) {
                    toast.error("Error Cancelling Subscription.");
                  }
                }
              }}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] rounded-[4px]"
            >
              Cancel Subscription
            </button>
          </div>
        )}
        {showCancleSession && (
          <div className="flex justify-end gap-x-[25px] font-medium text-base font-urbanist">
            <button
              onClick={() => {
                setshowCancleSession(false);
                navigate("/logout");
                // setManageSubscription(true);
              }}
              className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] rounded-[4px]"
            >
              Logging Out
            </button>
          </div>
        )}

        {showManageSubscription && (
          <>
            <div className="flex flex-col">
              <div className="flex gap-2 mb-4 border-b border-b-[#6D6D6D]">
                <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
                  Cancelling will delete all of your data. Would you like to go
                  on a maintenance plan for{" "}
                  <span className="font-bold">$15 a month?</span>
                </p>
                <button className=" py-1 text-[#04479C] flex-none rounded-[4px] border border-[#04479C] bg-white cursor-pointer  items-center gap-x-2.5 w-[240px] h-[40px]">
                  Yes, Maintenance Plan
                </button>
              </div>
              <div className="flex gap-2 mb-4 border-b border-b-[#6D6D6D]">
                <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
                  You can{" "}
                  <span className="font-bold">pause your subscription</span>{" "}
                  and not incur charges while retaining access to your account
                  and its features?
                </p>
                <button className=" py-1 text-[#04479C] flex-none rounded-[4px] justify-center flex border border-[#04479C] bg-white cursor-pointer items-center gap-x-2.5 w-[240px] h-[40px]">
                  <Pause />
                  Pause Subscription
                </button>
              </div>
              <div className="flex gap-2 ">
                <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
                  Are you sure you would like to cancel your subscription and
                  close your account? This will erase all the data associated
                  with your account once your subscription expires.
                </p>
                <button className="flex-none py-1 text-[#7E7E7E] rounded-[4px] bg-white cursor-pointer border border-[#7E7E7E] w-[240px] h-[40px]">
                  Cancel Subscription
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-4 font-medium text-base font-urbanist">
              <button
                onClick={onClose}
                className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CancelModal;
