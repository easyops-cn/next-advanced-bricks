import React, { useState, type PropsWithChildren } from "react";
import classNames from "classnames";
import type {
  ActionType,
  SimpleActionType,
} from "@next-bricks/basic/mini-actions";
import { useNavLinkActive } from "./useNavLinkActive";
import { WrappedLink, WrappedMiniActions } from "./bricks";
import { K, t } from "./i18n";

export interface NavLinkWithActionsProps {
  title?: string;
  url?: string;
  activeIncludes?: string[];
  actions?: ActionType[];
  onClick?: () => void;
  onActionClick?: (e: CustomEvent<SimpleActionType>) => void;
}

export function NavLinkWithActions({
  title,
  url,
  activeIncludes,
  actions,
  onClick,
  onActionClick,
  children,
}: PropsWithChildren<NavLinkWithActionsProps>) {
  const active = useNavLinkActive(url, activeIncludes);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [actionsShown, setActionsShown] = useState(false);

  return (
    <WrappedLink
      className={classNames("item", {
        "actions-active": actionsVisible,
        active,
      })}
      {...(url ? { url } : null)}
      onClick={onClick}
      onMouseEnter={() => {
        setActionsShown(true);
      }}
    >
      <div className="item-title" title={title}>
        {title || t(K.UNNAMED)}
      </div>
      {actionsShown && (
        <WrappedMiniActions
          className="actions"
          actions={actions}
          themeVariant="elevo"
          onActionClick={onActionClick}
          onVisibleChange={(e) => {
            setActionsVisible(e.detail);
          }}
        />
      )}
      {children}
    </WrappedLink>
  );
}
