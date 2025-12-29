import React, { useEffect } from "react";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { ElevoSpaceApi_getSpaceSchema } from "@next-api-sdk/llm-sdk";
import {
  NoticeDropdown,
  NoticeDropdownProps,
  NoticeItem,
} from "../../notice-dropdown/index.jsx";
import type { SpaceLogo, SpaceLogoProps } from "../space-logo/index.jsx";
import { SpaceConfigModal } from "./SpaceConfigModal/SpaceConfigModal";
import { K, t } from "../i18n.js";
import styles from "./SpaceNav.module.css";
import { SpaceDetail } from "../interfaces.js";
import { handleHttpError } from "@next-core/runtime";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
export interface NoticeDropdownEvents {
  "notice.click": CustomEvent<NoticeItem>;
  "mark.all.read": CustomEvent<void>;
}

export interface NoticeDropdownMapping {
  onNoticeClick: "notice.click";
  onMarkAllRead: "mark.all.read";
}

const WrappedNoticeDropdown = wrapBrick<
  NoticeDropdown,
  NoticeDropdownProps,
  NoticeDropdownEvents,
  NoticeDropdownMapping
>("ai-portal.notice-dropdown", {
  onNoticeClick: "notice.click",
  onMarkAllRead: "mark.all.read",
});
const WrappedSpaceLogo = wrapBrick<SpaceLogo, SpaceLogoProps>(
  "ai-portal.space-logo"
);

export interface SpaceNavProps {
  spaceDetail: SpaceDetail;
  notices?: NoticeItem[];
  onBack: () => void;
  onMembersClick: () => void;
  notifyCenterUrl: string;
  onMarkAllRead: () => void;
  onNoticeClick: (notice: NoticeItem) => void;
  onSpaceEdit?: () => void;
  aiEmployeeId?: string;
}

export function SpaceNav(props: SpaceNavProps) {
  const {
    spaceDetail,
    notices = [],
    notifyCenterUrl,
    onBack,
    onMarkAllRead,
    onNoticeClick,
    onSpaceEdit,
    aiEmployeeId,
  } = props;

  const [showDescription, setShowDescription] = React.useState(false);
  const [configModalVisible, setConfigModalVisible] = React.useState(false);
  const [configSchema, setConfigSchema] = React.useState<any>(null);

  const handleQuestionClick = () => {
    setShowDescription(!showDescription);
  };

  const handleSettingClick = async () => {
    setConfigModalVisible(true);
  };

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const schema = await ElevoSpaceApi_getSpaceSchema(
          spaceDetail.instanceId
        );
        setConfigSchema(schema);
      } catch (error) {
        handleHttpError(error);
      }
    };
    fetchSchema();
  }, [spaceDetail.instanceId]);

  return (
    <>
      <header className={styles.spaceWorkbenchHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.iconButton} onClick={onBack}>
            <WrappedIcon lib="antd" icon="arrow-left" theme="outlined" />
          </button>

          <WrappedSpaceLogo size={32} />

          <h1 className={styles.spaceTitle}>{spaceDetail.name}</h1>

          <div className={styles.actionIcons}>
            <button className={styles.iconButton} onClick={handleSettingClick}>
              <WrappedIcon lib="antd" icon="setting" theme="outlined" />
            </button>
            <button
              className={`${styles.iconButton} ${showDescription ? styles.active : ""}`}
              onClick={handleQuestionClick}
            >
              <WrappedIcon lib="antd" icon="question-circle" theme="outlined" />
            </button>
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* 暂时隐藏成员添加按钮，先不使用 */}
          {/* <WrappedIcon
            className={styles.iconButton}
            lib="antd"
            icon="usergroup-add"
            onClick={onMembersClick}
          ></WrappedIcon>

          <div className={styles.divider} />  */}

          <WrappedNoticeDropdown
            dataSource={notices}
            dropdownContentStyle={{ minWidth: "300px" }}
            hideNotifyCenterButton
            urlTarget="_blank"
            notifyCenterUrl={notifyCenterUrl}
            onMarkAllRead={() => onMarkAllRead()}
            onNoticeClick={(e) => onNoticeClick(e.detail)}
          />
        </div>
      </header>

      {showDescription && spaceDetail?.description && (
        <div className={styles.spaceDescription}>
          <div className={styles.descriptionHeader}>
            <p className={styles.descriptionTitle}>{t(K.DESCRIPTION)}</p>
            <button
              className={styles.descriptionEditButton}
              onClick={onSpaceEdit}
            >
              <WrappedIcon lib="antd" icon="edit" theme="outlined" />
            </button>
          </div>
          <p className={styles.descriptionContent}>{spaceDetail.description}</p>
        </div>
      )}

      <SpaceConfigModal
        visible={configModalVisible}
        configSchema={configSchema}
        spaceDetail={spaceDetail}
        aiEmployeeId={aiEmployeeId}
        onCancel={() => setConfigModalVisible(false)}
      />
    </>
  );
}
