import { Link } from "react-router-dom";
import mailIcon from "../../../../assets/mail-icon.gif";

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen bg-[#1E1D1D] flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full p-12">
        {/* Mail Icon */}
        <div className="flex justify-center mb-8">
          <img src={mailIcon} alt="Mail Icon" className="w-24 h-24" />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-[#232E33] mb-6">
            Thank You For Signing Up
          </h1>
          <p className="text-[#232E33] opacity-75 text-base leading-relaxed max-w-lg mx-auto">
            You're all set to scale your outreach with Zeekeo Launchpad. Here
            are the next steps to help you activate your account, and get
            started.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-12 relative">
          {/* Solid line coming into first step */}
          <div
            className="absolute left-3 w-0 border-l-2 border-solid border-[#0387FF]"
            style={{ top: "-2rem", height: "3.5rem" }}
          ></div>

          {/* Dashed line for remaining steps */}
          <div
            className="absolute left-3 w-0 border-l-2 border-dashed border-[#0387FF]"
            style={{ top: "1.5rem", height: "calc(100% - 1.5rem)" }}
          ></div>

          <div className="space-y-8">
            <Step
              number={1}
              title="Step 1: Login to Zeekeo Launchpad"
              description="Your account has been created. Simply login to the portal to access your account."
              buttonText="Continue to login"
              link="/login"
              isCurrent={true}
            />

            <Step
              number={2}
              title="Step 2: Connect Your LinkedIn Account"
              description="Once you've logged-in, please connect your LinkedIn Premium, Recruiter or Sales Navigator account with Zeekeo Launchpad. Learn how"
              buttonText="Connect LinkedIn to Zeekeo Launchpad"
              link="/settings?tab=Integrations"
            />

            <Step
              number={3}
              title="Step 3: Schedule your 1:1 onboarding session"
              description="Let us help you build a personalised campaign that meets your outreach goals. Schedule a free 1:1 session with an in-house outreach specialist."
              buttonText="Schedule Onboarding"
              link="https://calendly.com/d/cswr-js9-jfc/launchpad-onboarding"
              external
            />
          </div>
        </div>

        {/* Support */}
        <div className="text-center pt-8">
          <p className="text-[#696B6B] text-sm font-['Poppins'] mb-2 font-semibold">
            Trouble activating your account?
          </p>
          <p className="text-[#696B6B] text-sm font-['Poppins']">
            Please reach out to us:{" "}
            <a
              href="mailto:support@zeekoip.com"
              className="text-[#0387FF] hover:text-secondary transition-colors"
            >
              support@zeekoip.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Step component
function Step({
  title,
  description,
  buttonText,
  link,
  external = false,
  isCurrent = false,
}) {
  const ButtonContent = (
    <span className="flex items-center gap-1">
      {buttonText}
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="none"
        className="mt-0.5"
      >
        <path
          d="M2 1L6 4L2 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  return (
    <div className="flex gap-6 items-start">
      {/* Step indicator */}
      <div
        className="flex flex-col items-center"
        style={{ marginLeft: "-0.13rem" }}
      >
        <div className="relative">
          {/* Large transparent outline */}
          <div
            className={`w-8 h-8 rounded-full ${
              isCurrent ? "bg-sky-100" : "bg-gray-100"
            } flex items-center justify-center z-10 relative`}
          >
            {/* Small filled circle */}
            <div
              className={`w-2 h-2 rounded-full ${
                isCurrent ? "bg-[#0387FF]" : "bg-gray-400"
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-[#696B6B] text-lg font-['Urbanist']">{title}</h3>
        <p className="text-[#232E33BF] opacity-75 text-sm font-['Poppins'] mb-4 leading-relaxed">
          {description}
        </p>
        {external ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0387FF] hover:text-secondary font-medium font-['Poppins'] text-sm transition-colors cursor-pointer"
          >
            {ButtonContent}
          </a>
        ) : (
          <Link
            to={link}
            className="text-[#0387FF] hover:text-secondary font-medium font-['Poppins'] text-sm transition-colors cursor-pointer"
          >
            {ButtonContent}
          </Link>
        )}
      </div>
    </div>
  );
}
