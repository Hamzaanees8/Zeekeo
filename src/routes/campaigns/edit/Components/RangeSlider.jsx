import React, { useEffect } from "react";
import "../index.css";

const RangeSlider = ({ min = 0, max = 23, gap = 1, value, onChange, disabled }) => {
  const [minVal, setMinVal] = React.useState(value.min);
  const [maxVal, setMaxVal] = React.useState(value.max);

  useEffect(() => {
    onChange?.({ min: minVal, max: maxVal });
  }, [minVal, maxVal]);

  const updateTrack = () => {
    const range = document.querySelector(`.slider-track-${value.dayIndex}`);
    if (range) {
      const minPercent = ((minVal - min) / (max - min)) * 100;
      const maxPercent = ((maxVal - min) / (max - min)) * 100;
      range.style.left = `${minPercent}%`;
      range.style.right = `${100 - maxPercent}%`;
    }
  };

  useEffect(() => {
    updateTrack();
  }, [minVal, maxVal]);

  return (
    
      <div className="range-slider">
        <div className={`slider-track slider-track-${value.dayIndex} ${disabled ? "slider-track-disabled" : ""}`}></div>
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          disabled={disabled}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (maxVal - val >= gap) setMinVal(val);
          }}
          className={`min-val ${disabled ? "thumb-disabled" : ""}`}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          disabled={disabled}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (val - minVal >= gap) setMaxVal(val);
          }}
          className={`max-val ${disabled ? "thumb-disabled" : ""}`}
        />
      </div>
    
  );
};

export default RangeSlider;
