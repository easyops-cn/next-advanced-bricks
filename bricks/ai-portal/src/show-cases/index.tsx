import React, { useMemo, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import { getBasePath } from "@next-core/runtime";
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
import bg from "./images/bg.png";

initializeI18n(NS, locales);

const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");
const WrappedTabList = wrapBrick<
  TabList,
  TabListProps,
  TabListEvents,
  TabListMapping
>("ai-portal.tab-list", {
  onTabClick: "tab.click",
});

const { defineElement, property } = createDecorators();

export interface ShowCasesProps {
  list?: ShowCase[];
  taskUrlTemplate?: string;
}

export interface ShowCase {
  taskId: string;
  title: string;
  summary: string;
  scenario: string;
  thumbUrl?: string;
}

/**
 * 构件 `ai-portal.show-cases`
 */
export
@defineElement("ai-portal.show-cases", {
  styleTexts: [styleText],
})
class ShowCases extends ReactNextElement implements ShowCasesProps {
  @property({ attribute: false })
  accessor list: ShowCase[] | undefined;

  @property()
  accessor taskUrlTemplate: string | undefined;

  render() {
    return (
      <ShowCasesComponent
        list={this.list}
        taskUrlTemplate={this.taskUrlTemplate}
      />
    );
  }
}

function ShowCasesComponent({ list, taskUrlTemplate }: ShowCasesProps) {
  // Grouping the list by scenario
  const groups = useMemo<string[]>(() => {
    return ["", ...new Set(list?.map((item) => item.scenario).filter(Boolean))];
  }, [list]);

  const [activeGroup, setActiveGroup] = useState("");

  const filteredList = useMemo(() => {
    if (!activeGroup) {
      return list;
    }
    return list?.filter((item) => item.scenario === activeGroup);
  }, [activeGroup, list]);

  const tabs = useMemo<Tab[]>(() => {
    return groups.map((group) => ({
      id: group,
      label: group === "" ? t(K.ALL) : group,
    }));
  }, [groups]);

  if (!list?.length) {
    return null;
  }

  return (
    <>
      <div className="tips">{`${t(K.EXPLORE_EXCELLENT_CASES)} ↓`}</div>
      <WrappedTabList
        tabs={tabs}
        activeTab={activeGroup}
        onTabClick={(event) => setActiveGroup(event.detail.id)}
      />
      <ul className="cases">
        {filteredList?.map((item) => (
          <li key={item.taskId} className="item">
            <WrappedLink
              className="link"
              url={parseTemplate(taskUrlTemplate, item)}
            >
              <span
                className="thumbnail"
                style={{
                  backgroundImage: [
                    ...(item.thumbUrl
                      ? [`url(${getBasePath()}${item.thumbUrl})`]
                      : []),
                    `url(${bg})`,
                  ].join(", "),
                }}
              >
                {!item.thumbUrl && (
                  <>
                    <span className="quote" />
                    <span className="text">{item.summary}</span>
                  </>
                )}
              </span>
              <span className="title">
                <span>{item.title}</span>
              </span>
            </WrappedLink>
          </li>
        ))}
      </ul>
    </>
  );
}
