import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type { EoTooltip, ToolTipProps } from "@next-bricks/basic/tooltip";
import styleText from "./styles.shadow.css";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedTooltip = wrapBrick<EoTooltip, ToolTipProps>("eo-tooltip");

const { defineElement, property } = createDecorators();

export interface IconButtonProps {
  icon?: GeneralIconProps;
  tooltip?: string;
  disabled?: boolean;
  variant?: IconButtonVariant;
}

export type IconButtonVariant = "default" | "light" | "mini";

/**
 * 构件 `ai-portal.icon-button`
 */
export
@defineElement("ai-portal.icon-button", {
  styleTexts: [styleText],
})
class IconButton extends ReactNextElement implements IconButtonProps {
  @property({ attribute: false })
  accessor icon: GeneralIconProps | undefined;

  @property()
  accessor tooltip: string | undefined;

  @property({ type: Boolean })
  accessor disabled: boolean | undefined;

  @property({ render: false })
  accessor variant: IconButtonVariant | undefined;

  render() {
    return (
      <IconButtonComponent
        icon={this.icon}
        tooltip={this.tooltip}
        disabled={this.disabled}
      />
    );
  }
}

function IconButtonComponent({ icon, tooltip, disabled }: IconButtonProps) {
  const btn = (
    <button disabled={disabled}>
      <WrappedIcon {...icon} />
    </button>
  );

  if (tooltip) {
    return <WrappedTooltip content={tooltip}>{btn}</WrappedTooltip>;
  }

  return btn;
}
