import React from "react";
import { createDecorators } from "@next-core/element";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type { EoTooltip, ToolTipProps } from "@next-bricks/basic/tooltip";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import classNames from "classnames";
import "./host-context.css";
import styleText from "./workbench-action.shadow.css";

const { defineElement, property } = createDecorators();

const WrapLink = wrapBrick<Link, LinkProps>("eo-link");
const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedTooltip = wrapBrick<EoTooltip, ToolTipProps>("eo-tooltip");

export interface WorkbenchActionProps {
  icon?: GeneralIconProps;
  to?: string;
  target?: string;
  active?: boolean;
  href?: string;
  tooltip?: string;
}

/**
 * 工作台侧边栏操作按钮，显示图标链接并在右侧显示 tooltip
 * @insider
 */
export
@defineElement("visual-builder.workbench-action", {
  styleTexts: [styleText],
})
class WorkbenchAction extends ReactNextElement {
  /** 按钮图标配置 */
  @property({
    attribute: false,
  })
  accessor icon: GeneralIconProps | undefined;

  /** 路由跳转地址 */
  @property() accessor to: string | undefined;

  /** 是否处于激活状态 */
  @property({
    type: Boolean,
  })
  accessor active: boolean | undefined;

  /** 外部链接地址 */
  @property() accessor href: string | undefined;

  /** 链接打开方式 */
  @property() accessor target: string | undefined;

  /** 鼠标悬停时显示的提示文字 */
  @property() accessor tooltip: string | undefined;

  render(): React.ReactNode {
    return (
      <WorkbenchActionComponent
        to={this.to}
        icon={this.icon}
        active={this.active}
        href={this.href}
        target={this.target}
        tooltip={this.tooltip}
      />
    );
  }
}

function WorkbenchActionComponent({
  icon,
  to,
  active,
  href,
  target,
  tooltip,
}: WorkbenchActionProps) {
  return (
    <WrappedTooltip content={tooltip} placement="right">
      <WrapLink
        className={classNames("action", { active })}
        url={to}
        href={href}
        target={target as LinkProps["target"]}
      >
        <WrappedIcon {...icon} />
      </WrapLink>
    </WrappedTooltip>
  );
}
