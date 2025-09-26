import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { unwrapProvider } from "@next-core/utils/general";
import type { Button, ButtonProps } from "@next-bricks/basic/button";
import type { copyToClipboard as _copyToClipboard } from "@next-bricks/basic/data-providers/copy-to-clipboard";
import classNames from "classnames";
import "@next-core/theme";
import styleText from "./styles.shadow.css";

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

export const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");

export const copyToClipboard = unwrapProvider<typeof _copyToClipboard>(
  "basic.copy-to-clipboard"
);

const { defineElement, property } = createDecorators();

export interface CodeWrapperProps {
  preProps?: JSX.IntrinsicElements["pre"];
  showCopyButton?: boolean;
  themeVariant?: "default" | "elevo";
}

/**
 * 构件 `presentational.code-wrapper`
 *
 * @internal
 *
 * @part pre - 包裹代码内容的 `<pre>` 元素
 * @part copy - 复制按钮
 */
export
@defineElement("presentational.code-wrapper", {
  styleTexts: [styleText],
})
class CodeWrapper extends ReactNextElement implements CodeWrapperProps {
  @property({ attribute: false })
  accessor preProps:
    | React.PropsWithChildren<JSX.IntrinsicElements["pre"]>
    | undefined;

  /**
   * 是否展示复制按钮
   * @default true
   */
  @property({ type: Boolean })
  accessor showCopyButton: boolean | undefined;

  /**
   * 主题变体
   */
  @property()
  accessor themeVariant: "default" | "elevo" | undefined;

  render() {
    return (
      <CodeWrapperComponent
        preProps={this.preProps}
        showCopyButton={this.showCopyButton}
        themeVariant={this.themeVariant}
      />
    );
  }
}

function CodeWrapperComponent({
  preProps,
  showCopyButton,
  themeVariant,
}: CodeWrapperProps) {
  const ref = useRef<HTMLPreElement>(null);
  const [state, setState] = useState<"idle" | "success" | "failed">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  const handleCopy = useCallback(async () => {
    clearTimeout(timerRef.current);
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

      timerRef.current = setTimeout(() => {
        setState("idle");
      }, 2000);
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  const { children, ...restProps } = preProps ?? {};

  const prefParts = useMemo(() => {
    const parts = ["pre"];
    if (restProps.className?.includes("mermaid")) {
      parts.push("mermaid");
    }
    return parts.join(" ");
  }, [restProps.className]);

  return (
    <pre {...restProps} part={prefParts} ref={ref}>
      {children}
      {showCopyButton !== false && (
        <WrappedButton
          part="copy"
          themeVariant={themeVariant}
          className={classNames("copy", {
            success: state === "success",
            failed: state === "failed",
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
