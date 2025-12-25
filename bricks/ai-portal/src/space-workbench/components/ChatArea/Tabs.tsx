import React, { useEffect, useRef } from "react";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { K, t } from "../../i18n.js";
import styles from "./Tabs.module.css";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export interface TabItem {
  id: string;
  title: string;
}

export interface TabProps {
  id: string;
  title: string;
  active: boolean;
  onClick: (id: string) => void;
  onClose: (id: string, e: React.MouseEvent) => void;
}

export const Tab = ({ id, title, active, onClick, onClose }: TabProps) => {
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active && tabRef.current) {
      tabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [active]);

  return (
    <div
      ref={tabRef}
      className={`${styles.tab} ${active ? styles.active : ""}`}
      onClick={() => onClick(id)}
    >
      <WrappedIcon
        lib="antd"
        icon="message"
        theme="outlined"
        className={styles.tabIcon}
      />
      <span className={styles.tabTitle}>{title}</span>
      <button
        className={styles.closeButton}
        onClick={(e) => onClose(id, e)}
        title={t(K.CLOSE_TAB)}
      >
        <WrappedIcon lib="antd" icon="close" theme="outlined" />
      </button>
    </div>
  );
};

export interface TabsProps {
  tabs: TabItem[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string, e: React.MouseEvent) => void;
  onAddSession: () => void;
  onHistoryClick?: () => void;
}

export const Tabs = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onAddSession,
  onHistoryClick,
}: TabsProps) => {
  return (
    <div className={styles.tabBar}>
      <div className={styles.tabList}>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            title={tab.title}
            active={activeTabId === tab.id}
            onClick={onTabClick}
            onClose={onTabClose}
          />
        ))}
      </div>
      <div className={styles.tabActions}>
        <button
          className={styles.actionButton}
          onClick={onAddSession}
          title={t(K.NEW_SESSION)}
        >
          <WrappedIcon lib="antd" icon="plus" theme="outlined" />
        </button>
        <div className={styles.divider} />
        <button
          className={styles.actionButton}
          onClick={onHistoryClick}
          title={t(K.HISTORY_SESSIONS)}
        >
          <WrappedIcon lib="antd" icon="history" theme="outlined" />
        </button>
      </div>
    </div>
  );
};
