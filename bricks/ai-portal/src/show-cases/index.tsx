import React, { useMemo, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import type {
  Tab,
  TabList,
  TabListEvents,
  TabListMapping,
  TabListProps,
} from "../tab-list/index.js";
import type { ShowCase, ShowCaseProps } from "../show-case/index.js";
import type { ShowCaseType } from "../shared/interfaces.js";

initializeI18n(NS, locales);

const WrappedShowCase = wrapBrick<ShowCase, ShowCaseProps>(
  "ai-portal.show-case"
);
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
  list?: ShowCaseType[];
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
  accessor list: ShowCaseType[] | undefined;

  render() {
    return <ShowCasesComponent list={this.list} />;
  }
}

function ShowCasesComponent({ list }: ShowCasesProps) {
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
          <li key={item.conversationId}>
            <WrappedShowCase
              caseTitle={item.title}
              summary={item.summary}
              url={item.url}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
