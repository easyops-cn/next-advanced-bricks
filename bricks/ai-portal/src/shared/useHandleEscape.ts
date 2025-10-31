import { useEffect, useRef } from "react";
import type { TaskContextValue } from "./TaskContext";

export function useHandleEscape({
  activeDetail,
  activeExpandedViewJobId,
  activeFile,
  activeImages,
  subActiveDetail,
  setActiveFile,
  setActiveImages,
  setActiveExpandedViewJobId,
  setActiveDetail,
  setSubActiveDetail,
}: TaskContextValue) {
  const compositionRef = useRef(false);

  useEffect(() => {
    const onCompositionStart = () => {
      compositionRef.current = true;
    };
    const onCompositionEnd = () => {
      compositionRef.current = false;
    };
    document.addEventListener("compositionstart", onCompositionStart);
    document.addEventListener("compositionend", onCompositionEnd);
    return () => {
      document.removeEventListener("compositionstart", onCompositionStart);
      document.removeEventListener("compositionend", onCompositionEnd);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (compositionRef.current) {
        // Ignore key events during composition
        return;
      }
      if (e.key === "Escape") {
        if (activeFile) {
          setActiveFile(null);
        } else if (activeImages) {
          setActiveImages(null);
        } else if (activeExpandedViewJobId) {
          setActiveExpandedViewJobId(null);
        } else if (subActiveDetail) {
          setSubActiveDetail(null);
        } else if (activeDetail) {
          setActiveDetail(null);
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [
    activeDetail,
    activeExpandedViewJobId,
    activeFile,
    activeImages,
    subActiveDetail,
    setActiveFile,
    setActiveImages,
    setActiveExpandedViewJobId,
    setActiveDetail,
    setSubActiveDetail,
  ]);
}
