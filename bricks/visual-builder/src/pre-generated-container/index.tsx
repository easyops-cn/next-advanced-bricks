import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { ReactUseMultipleBricks } from "@next-core/react-runtime";
import type { UseBrickConf } from "@next-core/types";
import "@next-core/theme";

const { defineElement, property } = createDecorators();

/**
 * 构件 `visual-builder.pre-generated-container`
 *
 * @internal
 */
export
@defineElement("visual-builder.pre-generated-container", {
  shadowOptions: false,
})
class PreGeneratedContainer extends ReactNextElement {
  @property({ attribute: false })
  accessor useBrick: UseBrickConf | undefined;

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
  useBrick?: UseBrickConf;
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
