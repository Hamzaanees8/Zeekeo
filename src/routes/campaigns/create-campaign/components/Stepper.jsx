import React from "react";

const Stepper = ({ steps = [], activeStep = 0 }) => {
  return (
    <div className="flex items-center justify-between w-full py-6">
      {steps.map((step, index) => {
        const isStepActive = index <= activeStep; // for icon
        const isBarActive = index < activeStep; // for bar only
        const isCurrent = index === activeStep;
        const stepLength = steps.length;
        return (
          <div
            key={step.label}
            className="flex flex-col items-center relative"
          >
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute top-[22px] left-[85%] ${stepLength === 4 ? "w-[320%]" : "w-[230%]"}  h-[3px] z-0 rounded ${
                  isBarActive ? "bg-[#0387FF]" : "bg-[#7E7E7E]"
                }`}
              />
            )}

            {/* Step Icon Circle */}
            <div
              className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full border-2 ${
                isStepActive
                  ? "border-[#0387FF] bg-white"
                  : "border-[#7E7E7E] bg-white"
              }`}
            >
              {React.cloneElement(step.icon, {
                className: isStepActive ? "fill-[#0387FF]" : "fill-[#7E7E7E]",
              })}
            </div>

            {/* Step Label */}
            <span
              className={`mt-2 text-[12px] w-[88px] text-center min-h-[38px] ${
                isCurrent ? "text-[#0387FF] font-semibold" : "text-[#7E7E7E]"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
