import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const IframeResizer = () => {
  const location = useLocation();

  useEffect(() => {
    // Only run if we are inside an iframe
    if (window.self === window.top) return;

    const sendHeight = () => {
      // Calculate the total height of the content
      const height = document.documentElement.scrollHeight;

      // Post the height to the parent window
      window.parent.postMessage(
        {
          type: "ZEEKEO_RESIZE_IFRAME",
          height: height,
        },
        "*",
      );
    };

    // Observe any DOM changes (content loading, toggles, etc.)
    const observer = new ResizeObserver(() => {
      sendHeight();
    });

    observer.observe(document.body);

    // Initial send
    sendHeight();

    return () => observer.disconnect();
  }, [location]); // Re-run calculation on route change

  return null;
};

export default IframeResizer;
