import React from "react";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import {
  NoticeDropdown,
  NoticeDropdownProps,
  NoticeItem,
} from "../../../notice-dropdown/index.jsx";
import type { SpaceLogo, SpaceLogoProps } from "../../space-logo/index.jsx";
import { K, t } from "../../i18n.js";

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
  spaceName: string;
  notices?: NoticeItem[];
  onBack: () => void;
  onMembersClick: () => void;
  notifyCenterUrl: string;
  onMarkAllRead: () => void;
  onNoticeClick: (notice: NoticeItem) => void;
  description?: string;
  onSpaceEdit?: () => void;
}

export function SpaceNav(props: SpaceNavProps) {
  const {
    spaceName,
    notices = [],
    notifyCenterUrl,
    onBack,
    onMembersClick,
    onMarkAllRead,
    onNoticeClick,
    description,
    onSpaceEdit,
  } = props;

  const [showDescription, setShowDescription] = React.useState(false);

  const handleQuestionClick = () => {
    setShowDescription(!showDescription);
  };

  return (
    <>
      <header className="space-workbench-header">
        <div className="header-left">
          <button className="icon-button" onClick={onBack}>
            <WrappedIcon lib="antd" icon="arrow-left" theme="outlined" />
          </button>

          <WrappedSpaceLogo size={32} />

          <h1 className="space-title">{spaceName}</h1>

          <div className="action-icons">
            <button className="icon-button">
              <WrappedIcon lib="antd" icon="setting" theme="outlined" />
            </button>
            <button
              className={`icon-button ${showDescription ? "active" : ""}`}
              onClick={handleQuestionClick}
            >
              <WrappedIcon lib="antd" icon="question-circle" theme="outlined" />
            </button>
          </div>
        </div>

        <div className="header-right">
          <WrappedIcon
            className="icon-button"
            lib="antd"
            icon="usergroup-add"
            onClick={onMembersClick}
          ></WrappedIcon>

          <div className="divider" />

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

      {showDescription && description && (
        <div className="space-description">
          <div className="description-header">
            <p className="description-title">{t(K.DESCRIPTION)}</p>
            <button className="description-edit-button" onClick={onSpaceEdit}>
              <WrappedIcon lib="antd" icon="edit" theme="outlined" />
            </button>
          </div>
          <p className="description-content">{description}</p>
        </div>
      )}
    </>
  );
}
