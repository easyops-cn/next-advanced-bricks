// istanbul ignore file
import React from "react";
import { createDecorators, EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";
import {
  NS as ChatStreamNS,
  locales as ChatStreamLocales,
} from "../chat-stream/i18n.js";
import styles from "./styles.module.css";
import type { NoticeItem } from "../notice-dropdown/index.js";
import { SpaceDetail } from "./interfaces.js";
import { SpaceNav } from "./components/SpaceNav.js";
import { SpaceGuide } from "./components/SpaceGuide.js";

initializeI18n(NS, locales);
initializeI18n(ChatStreamNS, ChatStreamLocales);

const { defineElement, property, event } = createDecorators();

export interface SpaceWorkbenchProps {
  notifyCenterUrl: string;
  spaceDetail: SpaceDetail;
  notices?: NoticeItem[];
}

/**
 * 构件 `ai-portal.space-workbench`
 */
export
@defineElement("ai-portal.space-workbench", {
  shadowOptions: false,
})
class SpaceWorkbench extends ReactNextElement implements SpaceWorkbenchProps {
  @property({ attribute: false })
  accessor notices: NoticeItem[] | undefined;

  @property({ attribute: false })
  accessor spaceDetail!: SpaceDetail;

  @property()
  accessor notifyCenterUrl!: string;

  @event({ type: "go.back" })
  accessor #_goBackEvent!: EventEmitter<void>;

  @event({ type: "members.click" })
  accessor #_membersClickEvent!: EventEmitter<void>;

  @event({ type: "notice.click" })
  accessor #_noticeClickEvent!: EventEmitter<NoticeItem>;

  @event({ type: "mark.all.read" })
  accessor #_markAllReadEvent!: EventEmitter<void>;

  @event({ type: "space.edit" })
  accessor #_spaceEditEvent!: EventEmitter<void>;

  render() {
    return (
      <SpaceWorkbenchComponent
        spaceDetail={this.spaceDetail}
        notices={this.notices}
        notifyCenterUrl={this.notifyCenterUrl}
        onBack={() => this.#_goBackEvent.emit()}
        onMembersClick={() => this.#_membersClickEvent.emit()}
        onNoticeClick={(notice) => this.#_noticeClickEvent.emit(notice)}
        onMarkAllRead={() => this.#_markAllReadEvent.emit()}
        onSpaceEdit={() => this.#_spaceEditEvent.emit()}
      />
    );
  }
}

interface SpaceWorkbenchComponentProps extends SpaceWorkbenchProps {
  onBack: () => void;
  onMembersClick: () => void;
  onMarkAllRead: () => void;
  onNoticeClick: (notice: NoticeItem) => void;
  onSpaceEdit: () => void;
}

function SpaceWorkbenchComponent(props: SpaceWorkbenchComponentProps) {
  const {
    spaceDetail,
    notices = [],
    notifyCenterUrl,
    onBack,
    onMembersClick,
    onMarkAllRead,
    onNoticeClick,
    onSpaceEdit,
  } = props;

  return (
    <div className={styles.container}>
      <div className={styles.spaceWorkbenchContainer}>
        <SpaceNav
          spaceDetail={spaceDetail}
          notifyCenterUrl={notifyCenterUrl}
          notices={notices}
          onBack={onBack}
          onMembersClick={onMembersClick}
          onMarkAllRead={onMarkAllRead}
          onNoticeClick={onNoticeClick}
          onSpaceEdit={onSpaceEdit}
        />
        <SpaceGuide spaceDetail={spaceDetail} />
      </div>
    </div>
  );
}
