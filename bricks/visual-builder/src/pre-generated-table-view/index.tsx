import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import styleText from "./styles.shadow.css";

const { defineElement } = createDecorators();

/**
 * 预生成编排表格视图，使用 CSS Grid 布局渲染子构件
 *
 * @internal
 */
export
@defineElement("visual-builder.pre-generated-table-view", {
  styleTexts: [styleText],
})
class PreGeneratedTableView extends ReactNextElement {
  render() {
    return <PreGeneratedTableViewComponent />;
  }
}

export function PreGeneratedTableViewComponent() {
  return <slot />;
}
