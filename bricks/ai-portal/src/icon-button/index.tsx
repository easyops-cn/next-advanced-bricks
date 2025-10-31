import React, { useRef } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type { EoTooltip, ToolTipProps } from "@next-bricks/basic/tooltip";
import styleText from "./styles.shadow.css";
import { useHasAssignedNodes } from "@next-shared/hooks";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedTooltip = wrapBrick<EoTooltip, ToolTipProps>("eo-tooltip");

const { defineElement, property } = createDecorators();

export interface IconButtonProps {
  icon?: GeneralIconProps;
  tooltip?: string;
  tooltipHoist?: boolean;
  disabled?: boolean;
  variant?: IconButtonVariant;
}

export type IconButtonVariant =
  | "default"
  | "light"
  | "mini"
  | "mini-light"
  | "bordered";

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
  accessor tooltipHoist: boolean | undefined;

  @property({ type: Boolean })
  accessor disabled: boolean | undefined;

  @property({ render: false })
  accessor variant: IconButtonVariant | undefined;

  /** 是否缩小图标尺寸（部分 easyops 图标过大） */
  @property({ render: false, type: Boolean })
  accessor reduceIconSize: boolean | undefined;

  render() {
    return (
      <IconButtonComponent
        icon={this.icon}
        tooltip={this.tooltip}
        tooltipHoist={this.tooltipHoist}
        disabled={this.disabled}
      />
    );
  }
}

function IconButtonComponent({
  icon,
  tooltip,
  tooltipHoist,
  disabled,
}: IconButtonProps) {
  const slotRef = useRef<HTMLSlotElement>(null);
  const hasSlotted = useHasAssignedNodes(slotRef);

  const btn = (
    <button disabled={disabled} className={hasSlotted ? "has-slotted" : ""}>
      <WrappedIcon className="icon" {...icon} />
      <slot ref={slotRef} />
    </button>
  );

  if (tooltip) {
    return (
      <WrappedTooltip content={tooltip} hoist={tooltipHoist}>
        {btn}
      </WrappedTooltip>
    );
  }

  return btn;
}
