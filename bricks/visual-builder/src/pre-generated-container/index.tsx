import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { ReactUseMultipleBricks } from "@next-core/react-runtime";
import type { UseBrickConfOrRenderFunction } from "@next-core/react-runtime";
import "@next-core/theme";

const { defineElement, property } = createDecorators();

/**
 * 预生成编排容器，使用 useBrick 渲染指定的构件配置，并将 dataSource 作为数据传入
 *
 * @internal
 */
export
@defineElement("visual-builder.pre-generated-container", {
  shadowOptions: false,
})
class PreGeneratedContainer extends ReactNextElement {
  /** 要渲染的构件配置 */
  @property({ attribute: false })
  accessor useBrick: UseBrickConfOrRenderFunction | undefined;

  /** 传入构件的数据 */
  @property({ attribute: false })
  accessor dataSource: unknown | undefined;

  render() {
    return (
      <PreGeneratedContainerComponent
        useBrick={this.useBrick}
        dataSource={this.dataSource}
      />
    );
  }
}

export interface PreGeneratedContainerProps {
  useBrick?: UseBrickConfOrRenderFunction;
  dataSource?: unknown;
}

export function PreGeneratedContainerComponent({
  useBrick,
  dataSource,
}: PreGeneratedContainerProps) {
  if (!useBrick) {
    return null;
  }
  return (
    <ReactUseMultipleBricks
      useBrick={useBrick}
      data={dataSource}
      errorBoundary
    />
  );
}
