import React, { useState, useCallback, useEffect, useRef } from "react";
import { createDecorators, EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import {
  Popover,
  PopoverProps,
  PopoverEvents,
  PopoverEventsMapping,
  Placement,
} from "@next-bricks/basic/popover";
import { GeneralIcon, GeneralIconProps } from "@next-bricks/icons/general-icon";
import { Link, LinkProps, Target } from "@next-bricks/basic/link";
import { Button, ButtonProps } from "@next-bricks/basic/button";
import { EoCounterBadge, BadgeProps } from "@next-bricks/basic/counter-badge";
import { IconButton, IconButtonProps } from "../icon-button/index.js";
import { NoticeItem } from "../shared/interfaces.js";

import { parseTemplate } from "../shared/parseTemplate.js";
import projectNotifySvg from "./images/project-notify.svg?url";
import accountNotifySvg from "./images/account-notify.svg?url";
import systemNotifySvg from "./images/system-notify.svg?url";
import spaceNotifySvg from "./images/space-notify.svg?url";

initializeI18n(NS, locales);

const { defineElement, property, event } = createDecorators();

const WrappedPopover = wrapBrick<
  Popover,
  PopoverProps,
  PopoverEvents,
  PopoverEventsMapping
>("eo-popover", {
  onVisibleChange: "visible.change",
  onBeforeVisibleChange: "before.visible.change",
});

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");
const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");
const WrapperCounterBadge = wrapBrick<EoCounterBadge, BadgeProps>(
  "eo-counter-badge"
);
const WrapperIconButton = wrapBrick<IconButton, IconButtonProps>(
  "ai-portal.icon-button"
);

export interface NoticeDropdownProps {
  /** 消息数据列表 */
  dataSource?: NoticeItem[];
  /** 弹窗位置 */
  popoverPlacement?: Placement;
  /** 空状态文案 */
  emptyText?: string;
  /** 通知中心URL */
  notifyCenterUrl?: string;
  /** 详情链接 */
  urlTemplate?: string;
  /** 下拉框最大宽度 */
  dropdownMaxWidth?: string | number;
  /** 下拉框内容样式 */
  dropdownContentStyle?: React.CSSProperties;
  /** 是否隐藏进入消息中心按钮 */
  hideNotifyCenterButton?: boolean;
  /** 详情链接目标 */
  urlTarget?: Target;
}

/**
 * 构件 `ai-portal.notice-dropdown`
 *
 * 消息通知下拉框构件，用于展示消息列表
 */
export
@defineElement("ai-portal.notice-dropdown", {
  styleTexts: [styleText],
})
class NoticeDropdown extends ReactNextElement implements NoticeDropdownProps {
  /** 消息数据列表 */
  @property({ attribute: false })
  accessor dataSource: NoticeItem[] | undefined;

  /**
   * 弹窗位置
   */
  @property()
  accessor popoverPlacement: Placement | undefined;

  /** 空状态文案 */
  @property()
  accessor emptyText: string | undefined;

  /** 通知中心URL */
  @property()
  accessor notifyCenterUrl: string | undefined;

  /** 详情链接 */
  @property()
  accessor urlTemplate: string | undefined;

  /** 详情链接目标 */
  @property()
  accessor urlTarget: Target | undefined;

  /** 下拉框最大宽度 */
  @property()
  accessor dropdownMaxWidth: string | number | undefined;

  /** 下拉框内容样式 */
  @property({ attribute: false })
  accessor dropdownContentStyle: React.CSSProperties | undefined;

  /** 是否隐藏进入消息中心按钮 */
  @property({ type: Boolean })
  accessor hideNotifyCenterButton: boolean | undefined;

  /**
   * 消息项点击事件
   * @detail 消息 ID
   */
  @event({ type: "notice.click" })
  accessor #noticeClickEvent!: EventEmitter<NoticeItem>;

  /**
   * 全部已读点击事件
   */
  @event({ type: "mark.all.read" })
  accessor #markAllReadEvent!: EventEmitter<void>;

  #handleNoticeClick = (item: NoticeItem) => {
    this.#noticeClickEvent.emit(item);
  };

  #handleMarkAllRead = () => {
    this.#markAllReadEvent.emit();
  };

  render() {
    return (
      <NoticeDropdownComponent
        dataSource={this.dataSource}
        popoverPlacement={this.popoverPlacement}
        emptyText={this.emptyText}
        onNoticeClick={this.#handleNoticeClick}
        urlTemplate={this.urlTemplate}
        dropdownMaxWidth={this.dropdownMaxWidth}
        notifyCenterUrl={this.notifyCenterUrl}
        dropdownContentStyle={this.dropdownContentStyle}
        onMarkAllRead={this.#handleMarkAllRead}
        hideNotifyCenterButton={this.hideNotifyCenterButton}
        urlTarget={this.urlTarget}
      />
    );
  }
}

interface NoticeDropdownComponentProps extends NoticeDropdownProps {
  onNoticeClick: (item: NoticeItem) => void;
  onMarkAllRead: () => void;
}

function NoticeDropdownComponent({
  dataSource = [],
  popoverPlacement,
  emptyText,
  notifyCenterUrl,
  urlTemplate,
  dropdownMaxWidth,
  dropdownContentStyle,
  onNoticeClick,
  onMarkAllRead,
  hideNotifyCenterButton,
  urlTarget,
}: NoticeDropdownComponentProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);
  const handleBeforeVisibleChange = useCallback((e: CustomEvent<boolean>) => {
    setOpen(e.detail);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleNoticeItemClick = useCallback(
    (item: NoticeItem) => {
      onNoticeClick(item);
    },
    [onNoticeClick]
  );

  const handleMarkAllReadClick = useCallback(() => {
    onMarkAllRead();
  }, [onMarkAllRead]);

  // 添加外部点击检测，兼容在某些场景下没有触发关闭浮层的问题
  /* istanbul ignore next  */
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const path = event.composedPath?.() || [];

      const isInsideNoticeDropdown = path.some((element) => {
        if (element instanceof HTMLElement) {
          return element === popoverRef.current;
        }
        return false;
      });

      if (!isInsideNoticeDropdown) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [open]);

  return (
    <WrappedPopover
      className="popover"
      placement={popoverPlacement}
      trigger="click"
      active={open}
      arrow={false}
      distance={8}
      ref={popoverRef}
      onBeforeVisibleChange={handleBeforeVisibleChange}
    >
      <span slot="anchor">
        <slot name="trigger">
          <WrapperCounterBadge
            showZero={false}
            dot={true}
            count={dataSource?.length ?? 0}
            offset={[-5, 0]}
          >
            <WrapperIconButton icon={{ lib: "antd", icon: "bell" }} />
          </WrapperCounterBadge>
        </slot>
      </span>
      <div
        className="notice-dropdown-content"
        style={{ maxWidth: dropdownMaxWidth }}
      >
        <div className="header">
          <div className="title">{t(K.MESSAGE_LIST)}</div>
          <div className="close-btn" onClick={handleClose}>
            <WrappedIcon lib="antd" icon="close" />
          </div>
        </div>

        <div className="content" style={dropdownContentStyle}>
          {dataSource?.length > 0 ? (
            <ul className="message-list">
              {dataSource.map((item) => (
                <li key={item.id}>
                  <WrappedLink
                    className="link"
                    url={parseTemplate(urlTemplate, item)}
                    target={urlTarget}
                    onClick={() => handleNoticeItemClick(item)}
                  >
                    <div className="icon-wrapper">
                      <WrappedIcon
                        imgSrc={getNotifyIcon(item.type)}
                        keepSvgOriginalColor={true}
                      />
                    </div>
                    <div className="message-content">
                      <div className="primary-text">{item.title}</div>
                      {item.description && (
                        <div className="secondary-text">{item.description}</div>
                      )}
                    </div>
                  </WrappedLink>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              {emptyText || t(K.NO_NEW_MESSAGE)}
            </div>
          )}
        </div>

        <div className="footer">
          <WrappedButton
            disabled={!dataSource?.length}
            type="text"
            className="footer-button"
            onClick={handleMarkAllReadClick}
          >
            {t(K.MARK_ALL_READ)}
          </WrappedButton>
          {!hideNotifyCenterButton && (
            <WrappedButton
              href={notifyCenterUrl}
              type="text"
              className="footer-button"
            >
              {t(K.ENTER_MESSAGE_CENTER)} &gt;
            </WrappedButton>
          )}
        </div>
      </div>
    </WrappedPopover>
  );
}

export function getNotifyIcon(type: string): string {
  switch (type) {
    case "project":
      return projectNotifySvg;
    case "account":
      return accountNotifySvg;
    case "system":
      return systemNotifySvg;
    case "space":
      return spaceNotifySvg;
    default:
      return projectNotifySvg;
  }
}
