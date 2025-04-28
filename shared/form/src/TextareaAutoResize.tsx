import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import ResizeObserver from "resize-observer-polyfill";
import calculateAutoSizeStyle from "./utils/calculateAutoSizeStyle.js";

// istanbul ignore next
const modKey = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  ? "metaKey"
  : "ctrlKey";

export interface TextareaAutoResizeProps
  extends React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  /** @default true */
  autoResize?: boolean;
  minRows?: number | null;
  maxRows?: number | null;
  /** @default 2 */
  borderSize?: number;
  /** @default 8 */
  paddingSize?: number;
  containerRef?: React.RefObject<HTMLElement>;
  submitWhen?: "enter-without-shift" | "enter-with-mod";
}

export interface TextareaAutoResizeRef {
  focus(): void;
}

export const TextareaAutoResize = React.forwardRef<
  TextareaAutoResizeRef,
  TextareaAutoResizeProps
>(LegacyTextareaAutoResize);

function LegacyTextareaAutoResize(
  {
    autoResize: _autoResize,
    minRows,
    maxRows,
    borderSize,
    paddingSize,
    containerRef,
    value: propValue,
    style,
    submitWhen,
    onChange,
    onSubmit,
    onKeyDown,
    onCompositionStart,
    onCompositionEnd,
    ...props
  }: TextareaAutoResizeProps,
  ref: React.ForwardedRef<TextareaAutoResizeRef>
): React.JSX.Element {
  const autoResize = _autoResize ?? true;
  const [value, setValue] = useState(propValue ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [autoStyle, setAutoStyle] = useState<React.CSSProperties | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        const textarea = textareaRef.current;
        // istanbul ignore else: defensive check
        if (textarea) {
          const valueLength = textarea.value?.length;
          textarea.focus();
          valueLength && textarea.setSelectionRange(valueLength, valueLength);
        }
      },
    }),
    []
  );

  const doAutoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea && autoResize) {
      const style = calculateAutoSizeStyle(textarea, {
        minRows,
        maxRows,
        borderSize,
        paddingSize,
      });
      // istanbul ignore next
      if (process.env.NODE_ENV === "test") {
        setAutoStyle(style);
      } else {
        flushSync(() => {
          setAutoStyle(style);
        });
      }
    }
  }, [autoResize, maxRows, minRows, borderSize, paddingSize]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setValue(e.target.value);
    onChange?.(e);
  };

  useEffect(() => {
    setValue(propValue ?? "");
  }, [propValue]);

  useEffect(() => {
    doAutoResize();
  }, [doAutoResize, value]);

  const compositionRef = useRef(false);

  const handleCompositionStart = useCallback(
    (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      compositionRef.current = true;
      onCompositionStart?.(e);
    },
    [onCompositionStart]
  );

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      compositionRef.current = false;
      onCompositionEnd?.(e);
    },
    [onCompositionEnd]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (compositionRef.current) {
        // Ignore key events during composition
        return;
      }

      if (
        e.key === "Enter" &&
        (submitWhen === "enter-without-shift"
          ? !e.shiftKey
          : submitWhen === "enter-with-mod" && e[modKey])
      ) {
        e.preventDefault();
        e.stopPropagation();
        onSubmit?.(e);
      }

      onKeyDown?.(e);
    },
    [onKeyDown, onSubmit, submitWhen]
  );

  // istanbul ignore next
  useEffect(() => {
    const container = containerRef?.current;
    if (!container || !autoResize) {
      return;
    }
    let previousInlineSize: number | undefined;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          // istanbul ignore next: compatibility
          const currentInlineSize = entry.contentBoxSize
            ? entry.contentBoxSize[0]
              ? entry.contentBoxSize[0].inlineSize
              : (entry.contentBoxSize as unknown as ResizeObserverSize)
                  .inlineSize
            : entry.contentRect.width;
          if (
            currentInlineSize !== undefined &&
            currentInlineSize !== previousInlineSize
          ) {
            const isInitial = !previousInlineSize;
            previousInlineSize = currentInlineSize;
            if (!isInitial) {
              requestAnimationFrame(doAutoResize);
            }
          }
        }
      }
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [autoResize, containerRef, doAutoResize]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      value={value}
      style={{
        ...style,
        ...autoStyle,
      }}
      onChange={handleInputChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onKeyDown={handleKeyDown}
    />
  );
}
