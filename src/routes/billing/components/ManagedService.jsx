import zeekeo_logo from "../../../assets/zeekeo_pink.png";

const ManagedService = () => {
  return (
    <div className="bg-[#FFFFFF] border border-[#6D6D6D] p-3 md:p-3.5 rounded-[8px] shadow-md flex flex-col h-full">
      <p className="text-[#7E7E7E] font-semibold font-urbanist leading-[20px] text-[18px] md:text-[20px] mb-2 md:mb-3">
        Want your Outbound Fully Managed?
      </p>
      <div className="flex flex-col items-center gap-3 md:gap-4 justify-start p-[8px] md:p-[10px] flex-1">
        <div className="h-[70px] md:h-[70px] flex-shrink-0">
          <img
            src={zeekeo_logo}
            alt="Logo"
            className="h-[70px] md:h-[70px] w-auto object-contain"
          />
        </div>
        <div className="flex flex-col gap-1 md:gap-1.5 flex-1">
          <p className="text-[#7E7E7E] font-normal text-[14px] md:text-[15px] leading-[130%]">
            Step up to Zeekeo our done-for-you growth platform that combines
            AI-powered outreach with expert strategy and execution.
          </p>
          <p className="text-[#7E7E7E] font-normal mt-[6px] md:mt-[8px] text-[14px] md:text-[15px] leading-[130%]">
            Get 3 months of Appointment Setting for{" "}
            <span className="font-bold">FREE</span> when purchasing LinkedIn or
            Email Outreach.
          </p>
        </div>
      </div>
      <a
        href="https://calendly.com/d/cwjh-rjk-z7t/level-up-with-zeekeo"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button className="border h-[40px] md:h-[42px] cursor-pointer border-[#0387FF] px-4 md:px-6 py-2 text-[16px] md:text-[18px] text-white bg-[#0387FF] font-semibold font-urbanist w-full rounded-[6px] hover:bg-[#0270D9] transition-colors shadow-sm">
          Book a Call
        </button>
      </a>
    </div>
  );
};

export default ManagedService;
