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

const PLATFORM_CONFIG = new Map([
  [
    "EasyOps平台",
    {
      servers: ["cmdb", "cmdb_product_helper"],
    },
  ],
  [
    "Grafana",
    {
      servers: ["grafana"],
    },
  ],
  [
    "Kubernetes",
    {
      servers: ["kubernetes"],
    },
  ],
  [
    "监控事件",
    {
      servers: ["alert"],
    },
  ],
  [
    "浏览器",
    {
      servers: ["playwright"],
    },
  ],
  [
    "低代码",
    {
      servers: ["web-builder", "web-builder2"],
    },
  ],
  [
    "大模型",
    {
      servers: ["llm"],
    },
  ],
  [
    "故障排查",
    {
      servers: ["host-troubleshooting"],
    },
  ],
]);

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
  const [groupMap, platformMap] = useMemo(() => {
    const map = new Map<string, McpTool[]>();
    const platformMap = new Map<string, string[]>();
    list?.forEach((item) => {
      const groupName = t(
        `SERVER_${item.server.id.replaceAll("-", "_")}`,
        item.server.name
      );
      let list = map.get(groupName);
      if (!list) {
        map.set(groupName, (list = []));
      }
      list.push(item);

      const platform = [...PLATFORM_CONFIG.entries()].find(
        ([_name, { servers }]) => servers.includes(item.server.id)
      );
      const platformName = platform ? platform[0] : "其他";
      let groups = platformMap.get(platformName);
      if (!groups) {
        platformMap.set(platformName, (groups = []));
      }
      groups.push(groupName);
    });

    const orderedNames = ["CMDB"];
    const orderedMap = new Map<string, McpTool[]>(
      [...map.entries()].sort(([nameA], [nameB]) => {
        const indexA = orderedNames.indexOf(nameA);
        const indexB = orderedNames.indexOf(nameB);
        return (
          (indexA < 0 ? orderedNames.length : indexA) -
          (indexB < 0 ? orderedNames.length : indexB)
        );
      })
    );

    return [orderedMap, platformMap];
  }, [list]);

  const platforms = useMemo(() => {
    const orderedNames = [...PLATFORM_CONFIG.keys()];
    const names = [...platformMap.keys()];
    names.sort((a, b) => {
      const aIndex = orderedNames.indexOf(a);
      const bIndex = orderedNames.indexOf(b);
      return (
        (aIndex < 0 ? orderedNames.length : aIndex) -
        (bIndex < 0 ? orderedNames.length : bIndex)
      );
    });
    return [null, ...names];
  }, [platformMap]);

  const [activePlatform, setActivePlatform] = useState<string | null>(null);

  const filteredGroups = useMemo(() => {
    const groupedList = [...groupMap];
    if (activePlatform === null) {
      return groupedList;
    }
    const platformGroups = platformMap.get(activePlatform);
    return groupedList.filter(([group]) => platformGroups?.includes(group));
  }, [activePlatform, groupMap, platformMap]);

  return (
    <div className="container">
      <h1>{t(K.MCP_HUB)}</h1>
      <ul className="nav">
        {platforms?.map((platform) => (
          <li key={platform} className="item">
            <a
              className={classNames({ active: activePlatform === platform })}
              onClick={() => setActivePlatform(platform)}
            >
              {platform === null ? t(K.ALL) : platform}
            </a>
          </li>
        ))}
      </ul>
      <ul className="groups">
        {filteredGroups?.map(([groupName, items]) => (
          <li key={groupName} className="group">
            <h2>{groupName}</h2>
            <ul className="list">
              {items.map((item, index) => (
                <li key={index} className="item">
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
