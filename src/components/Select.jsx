const SelectDropdown = ({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "",
  className = "",
}) => {
  return (
    <div className="relative w-full">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required
        className={`appearance-none w-full pr-10 ${className}`}
        style={{ color: value ? "black" : "#7E7E7E" }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map(option => (
          <option
            key={option.value}
            value={option.value}
            style={{ color: "black" }}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom SVG icon */}
      <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2">
        <svg
          width="10"
          height="8"
          viewBox="0 0 10 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.943 0.768C9.90056 0.687222 9.83687 0.619568 9.7588 0.572338C9.68073 0.525108 9.59124 0.500095 9.5 0.5H0.499999C0.408921 0.500376 0.319668 0.525573 0.241839 0.572881C0.16401 0.62019 0.10055 0.687819 0.0582832 0.768497C0.0160162 0.849174 -0.00345847 0.939848 0.00195351 1.03077C0.00736549 1.12168 0.0374594 1.20941 0.0889988 1.2845L4.589 7.7845C4.63487 7.85112 4.69625 7.90559 4.76784 7.94322C4.83944 7.98085 4.91911 8.00052 5 8.00052C5.08088 8.00052 5.16056 7.98085 5.23215 7.94322C5.30375 7.90559 5.36513 7.85112 5.411 7.7845L9.911 1.2845C9.96304 1.20956 9.99354 1.12179 9.99919 1.03072C10.0048 0.939659 9.98539 0.848791 9.943 0.768ZM5 6.6215L1.454 1.5H8.546L5 6.6215Z"
            fill="black"
          />
        </svg>
      </div>
    </div>
  );
};

export default SelectDropdown;
