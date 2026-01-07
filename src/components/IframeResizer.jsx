import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const IframeResizer = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.self === window.top) return;

    const sendHeight = () => {
      // Use offsetHeight of the body to get the actual content footprint
      const height = document.body.offsetHeight;

      //  console.log("Reporting Height to Zeekeo:", height);

      window.parent.postMessage(
        {
          type: "ZEEKEO_RESIZE_IFRAME",
          height: height,
        },
        "*",
      );
    };

    // Observe Resize (Layout changes)
    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    // Observe Mutations (DOM adding/removing elements)
    const mutationObserver = new MutationObserver(() => {
      sendHeight();
    });

    // Start observing
    resizeObserver.observe(document.body);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Initial check
    sendHeight();

    // Clean up
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [location]);

  return null;
};

export default IframeResizer;
