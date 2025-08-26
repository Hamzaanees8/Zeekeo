const ToggleSwitch = ({ leftChecked, onChange, leftText, rightText }) => {
  return (
    <div className="p-1 bg-white">
      <button
        className={`px-4 py-1.5 text-sm md:px-6 md:py-2 md:text-[14px] font-normal cursor-pointer focus:outline-none ${
          leftChecked === true
            ? "bg-blue-500 text-white"
            : "bg-white text-black"
        }`}
        onClick={() => onChange(true)}
      >
        {leftText}
      </button>
      <button
        className={`px-4 py-1.5 text-sm md:px-6 md:py-2 md:text-[14px] font-normal cursor-pointer focus:outline-none ${
          leftChecked === false
            ? "bg-blue-500 text-white"
            : "bg-white text-black"
        }`}
        onClick={() => onChange(false)}
      >
        {rightText}
      </button>
    </div>
  );
};

export default ToggleSwitch;
