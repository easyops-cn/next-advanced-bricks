import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import imageGoals from "./images/goals@2x.png";
import imageActivities from "./images/activities@2x.png";
import imageSpaces from "./images/spaces@2x.png";
import imageServiceflows from "./images/serviceflows@2x.png";
import styleText from "./styles.shadow.css";

const { defineElement, property } = createDecorators();

export interface BlankStateProps {
  illustration?: BlankStateIllustration;
  description?: string;
}

export type BlankStateIllustration =
  | "goals"
  | "activities"
  | "collaboration-spaces"
  | "serviceflows";

/**
 * 空状态展示组件，提供预置插画和描述文字，并支持通过默认插槽插入自定义内容。
 *
 * @description 空状态展示组件，提供预置插画和描述文字，并支持通过默认插槽插入自定义内容。
 * @category ai-portal
 */
export
@defineElement("ai-portal.blank-state", {
  styleTexts: [styleText],
})
class BlankState extends ReactNextElement implements BlankStateProps {
  /**
   * 插画类型，可选 "goals"、"activities"、"collaboration-spaces"、"serviceflows"，默认使用 activities 插画
   */
  @property()
  accessor illustration: BlankStateIllustration | undefined;

  /**
   * 描述文字
   */
  @property()
  accessor description: string | undefined;

  render() {
    return (
      <BlankStateComponent
        illustration={this.illustration}
        description={this.description}
      />
    );
  }
}

function BlankStateComponent({ illustration, description }: BlankStateProps) {
  return (
    <>
      <img src={getIllustrationSrc(illustration)} width={184} height={138} />
      <p>{description}</p>
      <slot />
    </>
  );
}

function getIllustrationSrc(illustration?: BlankStateIllustration) {
  switch (illustration) {
    case "goals":
      return imageGoals;
    case "collaboration-spaces":
      return imageSpaces;
    case "serviceflows":
      return imageServiceflows;
    default:
      return imageActivities;
  }
}
