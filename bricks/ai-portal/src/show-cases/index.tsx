import React, { useMemo, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import classNames from "classnames";
import { getBasePath } from "@next-core/runtime";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import { parseTemplate } from "../shared/parseTemplate.js";

initializeI18n(NS, locales);

const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");

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
  const groups = useMemo<(string | null)[]>(() => {
    return [
      null,
      ...new Set(list?.map((item) => item.scenario).filter(Boolean)),
    ];
  }, [list]);

  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const filteredList = useMemo(() => {
    if (!activeGroup) {
      return list;
    }
    return list?.filter((item) => item.scenario === activeGroup);
  }, [activeGroup, list]);

  if (!list?.length) {
    return null;
  }

  return (
    <>
      <ul className="nav">
        {groups?.map((group) => (
          <li key={group} className="item">
            <a
              className={classNames({ active: activeGroup === group })}
              onClick={() => setActiveGroup(group)}
            >
              {group === null ? t(K.ALL) : group}
            </a>
          </li>
        ))}
      </ul>
      <ul className="cases">
        {filteredList?.map((item) => (
          <li key={item.taskId} className="item">
            <WrappedLink
              className="link"
              url={parseTemplate(taskUrlTemplate, item)}
            >
              <span
                className={classNames(
                  "placeholder",
                  item.thumbUrl ? "thumbnail" : "summary"
                )}
              >
                {item.thumbUrl ? (
                  <span
                    style={{
                      backgroundImage: `url(${getBasePath()}${item.thumbUrl})`,
                    }}
                  />
                ) : (
                  <span className="summary-1">
                    <span className="summary-2">
                      <span>{item.summary}</span>
                    </span>
                  </span>
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
