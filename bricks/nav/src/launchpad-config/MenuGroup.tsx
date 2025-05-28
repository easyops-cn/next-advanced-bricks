import React, { useCallback, useMemo, useState } from "react";
import { get, pick } from "lodash";
import classNames from "classnames";
import { __secret_internals, checkIfByTransform } from "@next-core/runtime";
import type { SimpleAction } from "@next-bricks/basic/actions";
import {
  WrappedDropdownActions,
  WrappedIcon,
  WrappedLink,
} from "./wrapped-bricks";
import type {
  ConfigMenuGroup,
  ConfigMenuItemDir,
  ConfigMenuItemNormal,
  ConfigVariant,
  MenuAction,
  MenuActionEventDetail,
} from "./interfaces";
import { getAppLocaleName } from "../shared/getLocaleName";

export type ProcessedConfigMenuItemNormal = ConfigMenuItemNormal & {
  __pathname?: string;
};

export interface MenuGroupProps {
  data: ConfigMenuGroup;
  actions?: MenuAction[];
  variant?: ConfigVariant;
  urlTemplate?: string;
  customUrlTemplate?: string;
  onMenuItemClick?(item: ProcessedConfigMenuItemNormal): void;
  onActionClick?: (detail: MenuActionEventDetail) => void;
}

export function MenuGroup({
  data,
  actions,
  variant,
  urlTemplate,
  customUrlTemplate,
  onMenuItemClick,
  onActionClick,
}: MenuGroupProps) {
  // Make it compatible
  data.type ??= "group";
  const { name, items } = data;
  const [dropdownActive, setDropdownActive] = useState(false);

  const filteredActions = useMemo(() => {
    return __secret_internals.legacyDoTransform(
      data,
      actions?.filter((item) => checkIfByTransform(item, data))
    ) as MenuAction[] | undefined;
  }, [actions, data]);

  const handleActionClick = useCallback(
    (event: CustomEvent<SimpleAction>) => {
      onActionClick?.({
        data,
        action: event.detail,
      });
    },
    [data, onActionClick]
  );

  return (
    <li
      className={classNames("menu-group", {
        empty: items.length === 0,
        blocked: data.allBlocked,
      })}
    >
      <div className="menu-group-label-wrapper">
        <span className="menu-group-label">{name}</span>
        {variant !== "menu-config" && !!filteredActions?.length && (
          <WrappedDropdownActions
            actions={filteredActions}
            onVisibleChange={(event) => {
              setDropdownActive(event.detail);
            }}
            onActionClick={handleActionClick}
          >
            <WrappedIcon
              lib="fa"
              icon="gear"
              className={classNames("menu-config", {
                active: dropdownActive,
              })}
            />
          </WrappedDropdownActions>
        )}
      </div>
      <ul className="menu">
        {items.map((item) =>
          item.type === "dir" ? (
            <MenuItemFolder
              key={item.instanceId}
              data={item}
              actions={actions}
              variant={variant}
              urlTemplate={urlTemplate}
              customUrlTemplate={customUrlTemplate}
              onMenuItemClick={onMenuItemClick}
              onActionClick={onActionClick}
            />
          ) : (
            <MenuItem
              key={`${item.type}-${item.id}`}
              data={item}
              actions={actions}
              variant={variant}
              urlTemplate={urlTemplate}
              customUrlTemplate={customUrlTemplate}
              onClick={(data) => {
                onMenuItemClick?.({ ...item, ...data });
              }}
              onActionClick={onActionClick}
            />
          )
        )}
      </ul>
    </li>
  );
}

export interface MenuItemProps {
  data: ConfigMenuItemNormal;
  actions?: MenuAction[];
  variant?: ConfigVariant;
  urlTemplate?: string;
  customUrlTemplate?: string;
  onClick?(data: { __pathname?: string }): void;
  onActionClick?: (detail: MenuActionEventDetail) => void;
}

export function MenuItem({
  data,
  actions,
  variant,
  urlTemplate,
  customUrlTemplate,
  onClick,
  onActionClick,
}: MenuItemProps) {
  const name = useMemo(
    () =>
      data.type === "app"
        ? getAppLocaleName(data.locales, data.name)
        : data.name,
    [data]
  );

  const [dropdownActive, setDropdownActive] = useState(false);

  const filteredActions = useMemo(
    () =>
      __secret_internals.legacyDoTransform(
        data,
        actions?.filter((item) => checkIfByTransform(item, data))
      ) as MenuAction[] | undefined,
    [actions, data]
  );

  const handleActionClick = useCallback(
    (event: CustomEvent<SimpleAction>) => {
      onActionClick?.({
        data,
        action: event.detail,
      });
    },
    [data, onActionClick]
  );

  let __pathname: string;
  let disabled = false;
  let linkUrl = "";

  if (variant === "launchpad-config" || variant === "menu-config") {
    if (data.type === "app") {
      linkUrl = parseUrlTemplate(urlTemplate, data, "")!;
    } else {
      // 禁用外链菜单项
      const urlObject = new URL(data.url, location.origin);
      __pathname = urlObject.pathname;
      disabled = urlObject.origin !== location.origin;
      linkUrl = disabled
        ? ""
        : parseUrlTemplate(
            customUrlTemplate,
            {
              ...data,
              __pathname,
            },
            ""
          )!;
    }
  }

  return (
    <li
      className={classNames("menu-item", {
        disabled: disabled || data.allBlocked,
      })}
      onClick={() => {
        onClick?.({ __pathname });
      }}
    >
      <WrappedLink
        tooltip={disabled ? "该菜单项为外链，不支持配置" : ""}
        url={linkUrl}
      >
        <WrappedIcon
          className="menu-icon"
          lib="easyops"
          icon="micro-app-center"
          {...(data.menuIcon?.lib && data.menuIcon.icon
            ? (pick(data.menuIcon, [
                "lib",
                "icon",
                "theme",
                "category",
                "prefix",
              ]) as any)
            : null)}
        />
        <span className="menu-item-label">{name}</span>
      </WrappedLink>
      {variant !== "menu-config" && !!filteredActions?.length && (
        <WrappedDropdownActions
          actions={filteredActions}
          onVisibleChange={(event) => {
            setDropdownActive(event.detail);
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
          onActionClick={handleActionClick}
          data-testid={`menu-item-actions-${data.id}`}
        >
          <WrappedIcon
            lib="fa"
            icon="gear"
            className={classNames("menu-config", { active: dropdownActive })}
          />
        </WrappedDropdownActions>
      )}
    </li>
  );
}

export interface MenuItemFolderProps {
  data: ConfigMenuItemDir;
  actions?: MenuAction[];
  variant?: ConfigVariant;
  urlTemplate?: string;
  customUrlTemplate?: string;
  onMenuItemClick?(item: ProcessedConfigMenuItemNormal): void;
  onActionClick?: (detail: MenuActionEventDetail) => void;
}

function MenuItemFolder({
  data,
  actions,
  variant,
  urlTemplate,
  customUrlTemplate,
  onMenuItemClick,
  onActionClick,
}: MenuItemFolderProps) {
  const { name, items } = data;
  const [dropdownActive, setDropdownActive] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const filteredActions = useMemo(
    () =>
      __secret_internals.legacyDoTransform(
        data,
        actions?.filter((item) => checkIfByTransform(item, data))
      ) as MenuAction[] | undefined,
    [actions, data]
  );

  const toggle = useCallback(() => {
    setExpanded((previous) => !previous);
  }, []);

  const handleActionClick = useCallback(
    (event: CustomEvent<SimpleAction>) => {
      onActionClick?.({
        data,
        action: event.detail,
      });
    },
    [data, onActionClick]
  );

  return (
    <li
      className={classNames("menu-item folder", {
        empty: items.length === 0,
        blocked: data.allBlocked,
      })}
    >
      <div className="menu-folder-label-wrapper">
        <WrappedLink onClick={toggle}>
          <WrappedIcon
            lib="fa"
            prefix="far"
            icon="folder-open"
            className="menu-icon"
          />
          <span className="menu-item-label">{name}</span>
          <WrappedIcon
            lib="antd"
            icon={expanded ? "up" : "down"}
            className="menu-item-toggle"
          />
        </WrappedLink>
        {variant !== "menu-config" && !!filteredActions?.length && (
          <WrappedDropdownActions
            actions={filteredActions}
            onVisibleChange={(event) => {
              setDropdownActive(event.detail);
            }}
            onActionClick={handleActionClick}
          >
            <WrappedIcon
              lib="fa"
              icon="gear"
              className={classNames("menu-config", {
                active: dropdownActive,
              })}
            />
          </WrappedDropdownActions>
        )}
      </div>
      <ul className={classNames("sub-menu", { expanded })}>
        {items.map((item) => (
          <MenuItem
            key={item.instanceId}
            data={item}
            actions={actions}
            variant={variant}
            urlTemplate={urlTemplate}
            customUrlTemplate={customUrlTemplate}
            onClick={(data) => {
              onMenuItemClick?.({ ...item, ...data });
            }}
            onActionClick={onActionClick}
          />
        ))}
      </ul>
    </li>
  );
}

function parseUrlTemplate(
  urlTemplate: string | undefined,
  data: unknown,
  fallback?: string
) {
  return (
    urlTemplate?.replace(/{{(.*?)}}/g, (_match, key) =>
      encodeURIComponent(String(get(data, key.trim())))
    ) ?? fallback
  );
}
