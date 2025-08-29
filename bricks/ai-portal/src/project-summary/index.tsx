import React, { useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { humanizeTime, HumanizeTimeFormat } from "@next-shared/datetime";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import { parseTemplate } from "../shared/parseTemplate.js";
import type {
  Tab,
  TabList,
  TabListEvents,
  TabListMapping,
  TabListProps,
} from "../tab-list/index.js";

initializeI18n(NS, locales);

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");
const WrappedTabList = wrapBrick<
  TabList,
  TabListProps,
  TabListEvents,
  TabListMapping
>("ai-portal.tab-list", {
  onTabClick: "tab.click",
});

const TAB_ID_CHATS = "chats";
const TAB_ID_GOALS = "goals";

const TABS: Tab[] = [
  {
    id: TAB_ID_CHATS,
    label: t(K.CHATS),
  },
  {
    id: TAB_ID_GOALS,
    label: t(K.GOALS),
  },
];

const { defineElement, property } = createDecorators();

export interface ProjectSummaryProps {
  chatList?: Chat[];
  chatUrlTemplate?: string;
}

export interface Chat {
  conversationId: string;
  title: string;
  startTime: number;
}

/**
 * 构件 `ai-portal.project-summary`
 */
export
@defineElement("ai-portal.project-summary", {
  styleTexts: [styleText],
})
class ProjectSummary extends ReactNextElement implements ProjectSummaryProps {
  @property({ attribute: false })
  accessor chatList: Chat[] | undefined;

  @property()
  accessor chatUrlTemplate: string | undefined;

  render() {
    return (
      <ProjectSummaryComponent
        chatList={this.chatList}
        chatUrlTemplate={this.chatUrlTemplate}
      />
    );
  }
}

function ProjectSummaryComponent({
  chatList,
  chatUrlTemplate,
}: ProjectSummaryProps) {
  const [activeTab, setActiveTab] = useState(TAB_ID_CHATS);
  return (
    <>
      <WrappedTabList
        tabs={TABS}
        activeTab={activeTab}
        onTabClick={(event) => setActiveTab(event.detail.id)}
      />
      {activeTab === TAB_ID_CHATS ? (
        chatList ? (
          <ul className="chats">
            {chatList.map((item) => (
              <li key={item.conversationId} className="item">
                <WrappedLink
                  className="link"
                  url={parseTemplate(chatUrlTemplate, item)}
                >
                  <div className="title">{item.title}</div>
                  <div className="time">
                    <WrappedIcon lib="antd" icon="clock-circle" />
                    {humanizeTime(item.startTime, HumanizeTimeFormat.relative)}
                  </div>
                </WrappedLink>
              </li>
            ))}
          </ul>
        ) : (
          <div className="loading">
            <WrappedIcon lib="antd" icon="loading-3-quarters" spinning />
          </div>
        )
      ) : null}
    </>
  );
}
