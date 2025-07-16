import React from "react";
import {
  MarkdownComponent,
  type MarkdownComponentProps,
} from "@next-shared/markdown";
import { CodeBlock } from "../CodeBlock/CodeBlock";

const components: MarkdownComponentProps["components"] = {
  pre: CodeBlock,
};

export function EnhancedMarkdown(props: MarkdownComponentProps) {
  return <MarkdownComponent {...props} components={components} />;
}
