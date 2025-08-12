import React, { useMemo, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import classNames from "classnames";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";

initializeI18n(NS, locales);

const DEFAULT_TOOL_ICON: GeneralIconProps = {
  lib: "antd",
  icon: "tool",
};

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

const { defineElement, property } = createDecorators();

export interface McpToolsProps {
  list?: McpTool[];
}

export interface McpTool {
  name: string;
  title: string;
  description: string;
  icon?: GeneralIconProps;
  server: McpServer;
}

export interface McpServer {
  id: string;
  name: string;
}

/**
 * 构件 `ai-portal.mcp-tools`
 */
export
@defineElement("ai-portal.mcp-tools", {
  styleTexts: [styleText],
})
class McpTools extends ReactNextElement implements McpToolsProps {
  @property({ attribute: false })
  accessor list: McpTool[] | undefined;

  render() {
    return <McpToolsComponent list={this.list} />;
  }
}

function McpToolsComponent({ list }: McpToolsProps) {
  // Grouping the list by server name
  const groupMap = useMemo(() => {
    const map = new Map<string, McpTool[]>();
    list?.forEach((item) => {
      const key = t(
        `SERVER_${item.server.id.replaceAll("-", "_")}`,
        item.server.name
      );
      let list = map.get(key);
      if (!list) {
        map.set(key, (list = []));
      }
      list.push(item);
    });
    return map;
  }, [list]);

  const groups = useMemo(() => [null, ...groupMap.keys()], [groupMap]);

  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const filteredGroups = useMemo(() => {
    const groupedList = [...groupMap];
    if (activeGroup === null) {
      return groupedList;
    }
    return groupedList.filter(([group]) => group === activeGroup);
  }, [activeGroup, groupMap]);

  return (
    <div className="container">
      <h1>{t(K.MCP_HUB)}</h1>
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
      <ul className="groups">
        {filteredGroups?.map(([groupName, items]) => (
          <li key={groupName} className="group">
            <h2>{groupName}</h2>
            <ul className="list">
              {items.map((item) => (
                <li key={item.name} className="item">
                  <div className="heading">
                    <WrappedIcon
                      className="icon"
                      {...(item.icon ?? DEFAULT_TOOL_ICON)}
                      fallback={DEFAULT_TOOL_ICON}
                    />
                    <div className="title">{item.title}</div>
                  </div>
                  <div className="description">{item.description}</div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
