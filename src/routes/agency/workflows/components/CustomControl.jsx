import React, { useEffect, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { FullScreen } from "../../../../components/Icons";

const CustomControl = ({ isFullscreen }) => {
  const { zoomIn, zoomOut, getZoom } = useReactFlow();
  const [zoom, setZoom] = useState(100);
  // const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setZoom(Math.round(getZoom() * 100));
    }, 200);
    return () => clearInterval(interval);
  }, [getZoom]);

  // useEffect(() => {
  //   const handleChange = () => {
  //     setIsFullscreen(Boolean(document.fullscreenElement));
  //   };
  //   document.addEventListener("fullscreenchange", handleChange);
  //   return () =>
  //     document.removeEventListener("fullscreenchange", handleChange);
  // }, []);

  const handleFullScreen = () => {
    const elem = document.getElementById("reactflow-wrapper");
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <>
      {/* Zoom Controls - Bottom Right */}
      <div className="absolute bottom-4 right-4 p-2 flex items-center gap-2 z-10">
        <button
          onClick={zoomOut}
          className="px-2 py-1 text-xs font-normal text-[#52555D] bg-[#EFEFEF] rounded-[4px]"
        >
          −
        </button>
        <div className="text-xs font-normal text-[#52555D]">{zoom}%</div>
        <button
          onClick={zoomIn}
          className="px-2 py-1 text-xs font-normal text-[#52555D] bg-[#EFEFEF] rounded-[4px]"
        >
          +
        </button>
      </div>

      {/* Fullscreen Toggle - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10">
        <button
          onClick={handleFullScreen}
          className="px-3 py-2 text-xs font-normal text-[#52555D] bg-[#EFEFEF] flex items-center gap-2  rounded-[6px]"
        >
          <FullScreen />
          {isFullscreen ? "Exit Full Screen" : "Full Screen"}
        </button>
      </div>
    </>
  );
};

export default CustomControl;
