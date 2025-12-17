import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import spaceLogoSvg from "../images/space-logo.svg?url";
import styleText from "./styles.shadow.css";

const { defineElement, property } = createDecorators();

export interface SpaceLogoProps {
  size?: number;
}

/**
 * 构件 `ai-portal.space-logo`
 *
 * 协作空间的 Logo 展示组件
 */
export
@defineElement("ai-portal.space-logo", {
  styleTexts: [styleText],
})
class SpaceLogo extends ReactNextElement implements SpaceLogoProps {
  @property({ type: Number })
  accessor size: number | undefined;

  render() {
    return <SpaceLogoComponent size={this.size} />;
  }
}

function SpaceLogoComponent({ size = 48 }: SpaceLogoProps) {
  const iconSize = Math.round(size * 0.875); // 图标为容器的 87.5%
  const borderRadius = Math.round(size * 0.25); // 圆角为容器的 25%

  return (
    <div
      className="space-logo"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${borderRadius}px`,
      }}
    >
      <img
        src={spaceLogoSvg}
        alt="Space Logo"
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
        }}
      />
    </div>
  );
}
