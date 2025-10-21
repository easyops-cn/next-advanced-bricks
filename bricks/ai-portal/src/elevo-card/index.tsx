import React, { useEffect, useRef, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import classNames from "classnames";
import styleText from "./styles.shadow.css";

const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");
const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

const { defineElement, property } = createDecorators();

export interface ElevoCardProps {
  cardTitle?: string;
  description?: string;
  url?: string;
  avatar?: string | IconWithColor;
  avatarType?: "icon" | "image";
}

export type IconWithColor = GeneralIconProps & {
  color?: string;
};

/**
 * 构件 `ai-portal.elevo-card`
 */
export
@defineElement("ai-portal.elevo-card", {
  styleTexts: [styleText],
})
class ElevoCard extends ReactNextElement implements ElevoCardProps {
  @property()
  accessor cardTitle: string | undefined;

  @property()
  accessor description: string | undefined;

  @property()
  accessor url: string | undefined;

  @property({ attribute: false })
  accessor avatar: string | GeneralIconProps | undefined;

  @property()
  accessor avatarType: "icon" | "image" | undefined;

  render() {
    return (
      <ElevoCardComponent
        cardTitle={this.cardTitle}
        description={this.description}
        url={this.url}
        avatar={this.avatar}
        avatarType={this.avatarType}
      />
    );
  }
}

function ElevoCardComponent({
  cardTitle,
  description,
  url,
  avatar,
  avatarType,
}: ElevoCardProps) {
  const footerRef = useRef<HTMLSlotElement>(null);
  const hasFooter = useHasAssignedNodes(footerRef);

  const actionsRef = useRef<HTMLSlotElement>(null);
  const hasActions = useHasAssignedNodes(actionsRef);

  return (
    <WrappedLink className={classNames("card", { clickable: !!url })} url={url}>
      <div className="header">
        <div className="heading">
          {avatarType !== "image" && avatar ? (
            <IconAvatar {...(avatar as IconWithColor)} />
          ) : (
            <div className="avatar" />
          )}
          <div className="title">{cardTitle}</div>
        </div>
        <div className="actions" hidden={!hasActions}>
          <slot name="actions" ref={actionsRef} />
        </div>
      </div>
      <div className="body">{description}</div>
      <div className="footer" hidden={!hasFooter}>
        <slot name="footer" ref={footerRef} />
      </div>
    </WrappedLink>
  );
}

function IconAvatar({ color, ...iconProps }: IconWithColor) {
  return (
    <div
      className="avatar"
      style={
        color
          ? {
              borderColor: `rgba(var(--theme-${color}-color-rgb-channel), 0.15)`,
              color: `var(--theme-${color}-color)`,
            }
          : undefined
      }
    >
      <WrappedIcon {...iconProps} />
    </div>
  );
}

function useHasAssignedNodes(slotRef: React.RefObject<HTMLSlotElement>) {
  const [hasAssignedNodes, setHasAssignedNodes] = useState(false);

  useEffect(() => {
    const slotElement = slotRef.current;

    /* istanbul ignore if */
    if (!slotElement) {
      return;
    }

    const listener = () => {
      setHasAssignedNodes(slotElement.assignedNodes().length > 0);
    };

    listener();
    slotElement.addEventListener("slotchange", listener);

    return () => {
      slotElement.removeEventListener("slotchange", listener);
    };
  }, [slotRef]);

  return hasAssignedNodes;
}
