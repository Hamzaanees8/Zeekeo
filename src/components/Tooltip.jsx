import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Portal-based tooltip that renders outside the DOM hierarchy
 * to avoid clipping by scroll containers with overflow:hidden/auto
 */
const Tooltip = ({
  children,
  content,
  position = "top", // "top" | "bottom" | "left" | "right"
  className = "",
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    if (visible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      let top, left;

      switch (position) {
        case "bottom":
          top = rect.bottom + 4;
          left = rect.left + rect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - 4;
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + 4;
          break;
        case "top":
        default:
          top = rect.top - 4;
          left = rect.left + rect.width / 2;
          break;
      }

      setCoords({ top, left });
    }
  }, [visible, position]);

  const getPositionStyles = () => {
    switch (position) {
      case "bottom":
        return "translate-x-[-50%]";
      case "left":
        return "translate-x-[-100%] translate-y-[-50%]";
      case "right":
        return "translate-y-[-50%]";
      case "top":
      default:
        return "translate-x-[-50%] translate-y-[-100%]";
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className={`inline-flex ${className}`}
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              zIndex: 9999,
            }}
            className={`${getPositionStyles()} bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none shadow-lg`}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
};

export default Tooltip;
