import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import ResizeObserver from "resize-observer-polyfill";

export function useAutoScroll(
  contentAvailable: boolean,
  scrollContainerRef: RefObject<HTMLDivElement>,
  scrollContentRef: RefObject<HTMLDivElement>
) {
  const detectScrolledUpRef = useRef(false);
  const manualScrolledRef = useRef(false);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const contentContainer = scrollContentRef.current;
    if (manualScrolledRef.current || !scrollContainer || !contentContainer) {
      return;
    }

    const handleScroll = () => {
      setScrollable(
        scrollContainer.scrollTop + scrollContainer.clientHeight! + 24 <
          scrollContainer.scrollHeight
      );
      if (!detectScrolledUpRef.current) {
        return;
      }
      manualScrolledRef.current =
        scrollContainer.scrollTop + scrollContainer.clientHeight! + 6 <
        scrollContainer.scrollHeight;
    };
    scrollContainer.addEventListener("scroll", handleScroll);

    let timer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      if (manualScrolledRef.current) {
        return;
      }
      detectScrolledUpRef.current = false;
      // Scroll to the bottom of the content container
      scrollContainer.scrollTo({
        top: contentContainer.scrollHeight,
        behavior: "instant",
      });
      clearTimeout(timer);
      timer = setTimeout(() => {
        detectScrolledUpRef.current = true;
      }, 100);
    });
    observer.observe(contentContainer);

    return () => {
      observer.disconnect();
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
    // Auto scroll after the conversation becomes available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentAvailable]);

  const scrollToBottom = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    scrollContainer?.scrollTo({
      top: scrollContainer?.scrollHeight,
      behavior: "instant",
    });
  }, [scrollContainerRef]);

  return { scrollable, scrollToBottom };
}
