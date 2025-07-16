import React, { useCallback, useRef, useState } from "react";
import classNames from "classnames";
import { copyToClipboard, WrappedButton } from "../bricks";
import styles from "./CodeBlock.module.css";

const COPY_BUTTON_ICON = {
  lib: "fa",
  prefix: "far",
  icon: "copy",
} as const;

const COPY_BUTTON_ICON_SUCCESS = {
  lib: "fa",
  prefix: "fas",
  icon: "check",
} as const;

const COPY_BUTTON_ICON_FAILED = {
  lib: "fa",
  prefix: "fas",
  icon: "triangle-exclamation",
} as const;

export type CodeBlockProps = JSX.IntrinsicElements["pre"] & {
  node?: unknown;
};

export function CodeBlock({ children, node, ...props }: CodeBlockProps) {
  const ref = useRef<HTMLPreElement>(null);
  const isCodeBlock = props.className?.includes("language-");
  const [state, setState] = useState<"idle" | "success" | "failed">("idle");

  const handleCopy = useCallback(async () => {
    setState("idle");
    const content = ref.current?.querySelector("code")?.textContent;
    if (content) {
      try {
        await copyToClipboard(content);
        setState("success");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to copy code block content to clipboard.", error);
        setState("failed");
      }

      const timer = setTimeout(() => {
        setState("idle");
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <pre
      {...props}
      className={classNames(props.className, styles["code-block"])}
      ref={ref}
    >
      {children}
      {isCodeBlock && (
        <WrappedButton
          themeVariant="elevo"
          className={classNames(styles.copy, {
            [styles.success]: state === "success",
            [styles.failed]: state === "failed",
          })}
          onClick={handleCopy}
          icon={
            state === "success"
              ? COPY_BUTTON_ICON_SUCCESS
              : state === "failed"
                ? COPY_BUTTON_ICON_FAILED
                : COPY_BUTTON_ICON
          }
        />
      )}
    </pre>
  );
}
