import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import imageGoals from "./images/goals@2x.png";
import imageActivities from "./images/activities@2x.png";
import styleText from "./styles.shadow.css";

const { defineElement, property } = createDecorators();

export interface BlankStateProps {
  illustration?: BlankStateIllustration;
  description?: string;
}

export type BlankStateIllustration = "goals" | "activities";

/**
 * 构件 `ai-portal.blank-state`
 */
export
@defineElement("ai-portal.blank-state", {
  styleTexts: [styleText],
})
class BlankState extends ReactNextElement implements BlankStateProps {
  @property()
  accessor illustration: BlankStateIllustration | undefined;

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
    </>
  );
}

function getIllustrationSrc(illustration?: BlankStateIllustration) {
  switch (illustration) {
    case "goals":
      return imageGoals;
    default:
      return imageActivities;
  }
}
