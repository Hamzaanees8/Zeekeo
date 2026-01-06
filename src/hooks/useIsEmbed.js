import { useSearchParams } from "react-router-dom";

export function useIsEmbed() {
  const [searchParams] = useSearchParams();
  
  // Check URL first, then fallback to window detection
  const hasParam = searchParams.get("embed") === "true";
  const isIframe = window.self !== window.top;

  return hasParam || isIframe;
}