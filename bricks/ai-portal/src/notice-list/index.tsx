import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import classNames from "classnames";
import { createDecorators, EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";

import { GeneralIcon, GeneralIconProps } from "@next-bricks/icons/general-icon";
import { Link, LinkProps, Target } from "@next-bricks/basic/link";
import type {
  Checkbox,
  CheckboxProps,
  CheckboxValueType,
} from "@next-bricks/form/checkbox";
import { parseTemplate } from "../shared/parseTemplate.js";
import { humanizeTime, HumanizeTimeFormat } from "@next-shared/datetime";
import { getNotifyIcon, NoticeItem } from "../notice-dropdown/index.js";
import { Button, ButtonProps } from "@next-bricks/basic/button";

initializeI18n(NS, locales);

const { defineElement, property, event } = createDecorators();

export interface CheckboxEvents {
  change: CustomEvent<CheckboxValueType[]>;
}

export interface CheckboxMapping {
  onValuesChange: "change";
}

const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");
const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");
const WrappedCheckbox = wrapBrick<
  Checkbox,
  CheckboxProps,
  CheckboxEvents,
  CheckboxMapping
>("eo-checkbox", {
  onValuesChange: "change",
});

export interface NoticeListProps {
  /** 消息数据列表 */
  dataSource?: NoticeItem[];
  /** 空状态文案 */
  emptyText?: string;
  /** 详情链接 */
  urlTemplate?: string;
  /** 详情链接目标 */
  urlTarget?: Target;
  /** 选中的消息 ID 数组 */
  selectedIds?: string[];
}

/**
 * 构件 `ai-portal.notice-list`
 *
 * 消息通知列表构件，用于展示消息列表，支持批量操作
 */
export
@defineElement("ai-portal.notice-list", {
  styleTexts: [styleText],
})
class NoticeList extends ReactNextElement implements NoticeListProps {
  /** 消息数据列表 */
  @property({ attribute: false })
  accessor dataSource: NoticeItem[] | undefined;

  /** 空状态文案 */
  @property()
  accessor emptyText: string | undefined;

  /** 详情链接 */
  @property()
  accessor urlTemplate: string | undefined;

  /** 详情链接目标 */
  @property()
  accessor urlTarget: Target | undefined;

  /** 选中的消息 ID 数组 */
  @property({ attribute: false })
  accessor selectedIds: string[] | undefined;

  /**
   * 消息项点击事件
   * @detail 消息项数据
   */
  @event({ type: "notice.click" })
  accessor #noticeClickEvent!: EventEmitter<NoticeItem>;

  /**
   * 标记消息项已读事件
   * @detail 选中的消息 ID 数组
   */
  @event({ type: "mark.items.read" })
  accessor #markItemsReadEvent!: EventEmitter<NoticeItem[]>;

  /**
   * 全部已读事件
   */
  @event({ type: "mark.all.read" })
  accessor #markAllReadEvent!: EventEmitter<void>;

  #handleNoticeClick = (item: NoticeItem) => {
    this.#noticeClickEvent.emit(item);
  };

  #handleMarkItemsRead = (items: NoticeItem[]) => {
    this.#markItemsReadEvent.emit(items);
  };

  #handleMarkAllRead = () => {
    this.#markAllReadEvent.emit();
  };

  render() {
    return (
      <NoticeListComponent
        dataSource={this.dataSource}
        emptyText={this.emptyText}
        onNoticeClick={this.#handleNoticeClick}
        onMarkItemsRead={this.#handleMarkItemsRead}
        onMarkAllRead={this.#handleMarkAllRead}
        selectedIds={this.selectedIds}
        urlTemplate={this.urlTemplate}
        urlTarget={this.urlTarget}
      />
    );
  }
}

interface NoticeListComponentProps extends NoticeListProps {
  onNoticeClick: (item: NoticeItem) => void;
  onMarkItemsRead: (items: NoticeItem[]) => void;
  onMarkAllRead: () => void;
}

interface NoticeListItemProps {
  item: NoticeItem;
  selected: boolean;
  urlTemplate?: string;
  urlTarget?: Target;
  onSelectItem: (id: string, checked: boolean) => void;
  onNoticeClick: (item: NoticeItem) => void;
}

function NoticeListComponent({
  dataSource = [],
  emptyText,
  onNoticeClick,
  onMarkItemsRead,
  onMarkAllRead,
  urlTemplate,
  urlTarget,
  selectedIds: _selectedIds,
}: NoticeListComponentProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(_selectedIds || [])
  );

  const currentAllIds = useMemo(() => {
    //  过滤当前已读的项目，只有未读的项目可以选中
    return (
      dataSource?.filter((item) => !item.isRead).map((item) => item.id) || []
    );
  }, [dataSource]);

  const isAllSelected = useMemo(() => {
    return (
      currentAllIds.length > 0 &&
      currentAllIds.every((id) => selectedIds.has(id))
    );
  }, [currentAllIds, selectedIds]);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const newSelectedIds = new Set(checked ? currentAllIds : []);
      setSelectedIds(newSelectedIds);
    },
    [currentAllIds]
  );

  const handleSelectItem = useCallback(
    (id: string, checked: boolean) => {
      const newSelectedIds = checked
        ? new Set([...selectedIds, id])
        : new Set(
            Array.from(selectedIds).filter((selectedId) => selectedId !== id)
          );

      setSelectedIds(newSelectedIds);
    },
    [selectedIds]
  );

  const handleNoticeItemClick = useCallback(
    (item: NoticeItem) => {
      onNoticeClick(item);
    },
    [onNoticeClick]
  );

  useEffect(() => {
    setSelectedIds(new Set(_selectedIds || []));
  }, [_selectedIds]);

  return (
    <div>
      <div className="toolbar">
        <WrappedCheckbox
          disabled={currentAllIds?.length === 0}
          themeVariant="elevo"
          className="all-checkbox"
          options={[{ label: "", value: "selectAll" }]}
          value={isAllSelected ? ["selectAll"] : []}
          onValuesChange={(e) => handleSelectAll(!!e.detail?.length)}
        />

        <WrappedButton
          className="read-link"
          type="link"
          themeVariant="elevo"
          disabled={selectedIds.size === 0}
          onClick={() =>
            onMarkItemsRead(
              dataSource.filter((item) => selectedIds.has(item.id))
            )
          }
        >
          {t(K.MARK_READ)}
        </WrappedButton>
        <WrappedButton
          className="read-link"
          type="link"
          onClick={onMarkAllRead}
          themeVariant="elevo"
        >
          {t(K.MARK_ALL_READ)}
        </WrappedButton>
      </div>

      <div className="content">
        {dataSource?.length > 0 ? (
          <ul className="message-list">
            {dataSource.map((item) => (
              <li key={item.id}>
                <NoticeListItem
                  item={item}
                  selected={selectedIds.has(item.id)}
                  urlTemplate={urlTemplate}
                  urlTarget={urlTarget}
                  onSelectItem={handleSelectItem}
                  onNoticeClick={handleNoticeItemClick}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">{emptyText || t(K.NO_MESSAGE)}</div>
        )}
      </div>
    </div>
  );
}

function NoticeListItem({
  item,
  selected,
  urlTemplate,
  urlTarget,
  onSelectItem,
  onNoticeClick,
}: NoticeListItemProps) {
  const checkboxRef = useRef<Checkbox>(null);

  // stop propagation and prevent default manually in eo-link
  useEffect(() => {
    const el = checkboxRef.current;
    if (!el) return;
    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
    };
    el.addEventListener("click", handleClick);
    return () => {
      el.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <WrappedLink
      className={classNames("message-item-link", {
        "has-read": item.isRead,
      })}
      url={item.url ?? parseTemplate(urlTemplate, item)}
      target={urlTarget}
      onClick={() => onNoticeClick(item)}
    >
      <div className="left">
        <WrappedCheckbox
          ref={checkboxRef}
          disabled={item.isRead}
          themeVariant="elevo"
          className="item-checkbox"
          options={[{ label: "", value: item.id }]}
          value={selected ? [item.id] : []}
          onValuesChange={(e) => {
            onSelectItem(item.id, !!e.detail?.length);
          }}
        />
        <div className="icon-wrapper">
          <WrappedIcon
            imgSrc={getNotifyIcon(item.type)}
            keepSvgOriginalColor={true}
          />
        </div>
        <div className="title" title={item.title}>
          {item.title}
        </div>
      </div>

      <div className="right">
        <div className="message-time">
          {humanizeTime(item.time, HumanizeTimeFormat.relative)}
        </div>
      </div>
    </WrappedLink>
  );
}
