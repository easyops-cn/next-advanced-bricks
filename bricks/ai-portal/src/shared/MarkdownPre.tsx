import React from "react";
import { wrapBrick } from "@next-core/react-element";
import {
  CodeWrapper,
  type CodeWrapperProps,
} from "@next-bricks/presentational/code-wrapper";
import styles from "./MarkdownPre.module.css";

const WrappedCodeWrapper = wrapBrick<CodeWrapper, CodeWrapperProps>(
  "presentational.code-wrapper"
);

export type MarkdownComponentProps = JSX.IntrinsicElements["pre"] & {
  node?: unknown;
};

export function MarkdownPre({ node, ...props }: MarkdownComponentProps) {
  return (
    <WrappedCodeWrapper
      className={styles["code-wrapper"]}
      preProps={props}
      showCopyButton={!!props.className?.includes("shiki")}
      themeVariant="elevo"
    />
  );
}
