const ToggleSwitch = ({ value, onChange, onColor, offColor }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer w-[18px] h-2.5">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={value}
        onChange={e => onChange(e.target.checked)}
      />
      <div
        className="w-[18px] h-2.5 rounded-full transition-all duration-300"
        style={{ backgroundColor: value ? onColor : offColor }}
      ></div>
      <div
        className="absolute w-1.5 h-1.5 left-0.5 bg-white rounded-full transition-transform duration-300"
        style={{ transform: value ? "translateX(8px)" : "translateX(0px)" }}
      ></div>
    </label>
  );
};

export default ToggleSwitch;
