import React, { useEffect, useState, useMemo } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";
import styleText from "./styles.shadow.css";

import type { Button, ButtonProps } from "@next-bricks/basic/button";
import classNames from "classnames";
import type {
  GeneralSearch,
  SearchProps,
  SearchEvents,
  SearchEventsMap,
} from "@next-bricks/form/search";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
initializeI18n(NS, locales);
import { getRuntime, getHistory } from "@next-core/runtime";
import { JsonStorage } from "@next-shared/general/JsonStorage";
import { auth } from "@next-core/easyops-runtime";
import { uniq } from "lodash";
import { Select, ConfigProvider, theme } from "antd";
import { StyleProvider, createCache } from "@ant-design/cssinjs";
import { InstanceApi_postSearchV3 } from "@next-api-sdk/cmdb-sdk";
import type { EoTooltip, ToolTipProps } from "@next-bricks/basic/tooltip";
import { useCurrentTheme } from "@next-core/react-runtime";

const { defineElement } = createDecorators();

const storageKey = `querier-search-recent-visits:${
  (auth.getAuth() as Record<string, string>)?.org
}`;
const storage = new JsonStorage(localStorage);
const fullTextUrl = "search/result?q=%{q}%";
const ipSearchUrl = "search/new/ipSearch?q=%{q}%";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");
export const WrappedSearch = wrapBrick<
  GeneralSearch,
  SearchProps,
  SearchEvents,
  SearchEventsMap
>("eo-search", {
  onChange: "change",
  onSearch: "search",
});
const WrappedToolTip = wrapBrick<EoTooltip, ToolTipProps>("eo-tooltip");
/**
 * 构件 `nav.query-search`
 */
export
@defineElement("nav.query-search", {
  styleTexts: [styleText],
})
class QuerySearch extends ReactNextElement {
  render() {
    return <QuerySearchComponent shadowRoot={this.shadowRoot} />;
  }
}

export interface QuerySearchComponentProps {
  shadowRoot: ShadowRoot | null;
  // Define react event handlers here.
}
enum QuerierTypes {
  fullText = "fullText",
  instanceSearch = "instanceSearch",
  relationSearch = "relationSearch",
  link = "link",
  ipSearch = "ipSearch",
}
interface QuerierConfig {
  url: string;
  searchPlaceholder: string;
}

interface Querier {
  name: string;
  type: QuerierTypes;
  disabled: boolean;
  showInApps: string[];

  config: QuerierConfig;
}
interface QuerierOption extends Querier {
  label: string;
  value: string;
}
export function QuerySearchComponent(props: QuerySearchComponentProps) {
  const { shadowRoot } = props;
  const appId = getRuntime().getCurrentApp()?.id || "";
  const visits: string[] = storage.getItem(storageKey) ?? [];
  const currentTheme = useCurrentTheme();
  const [showInput, setShowInput] = useState<boolean>();
  const [searchKey, setSearchKey] = useState<string>();
  const [querierList, setQuerierList] = useState<Querier[]>([]);
  const [querierOptions, setQuerierOptions] = useState<QuerierOption[]>([]);
  const [selectedQuerier, setSelectedQuerier] = useState<QuerierOption>();

  //屏幕小于一定宽度，点击图标或者快捷键直接跳走
  const checkIsDirectJump = (): boolean => {
    return (
      document.documentElement.clientWidth -
        (shadowRoot?.host?.parentElement?.clientWidth || 0) -
        500 <
      200
    );
  };

  const cache = useMemo(() => {
    return createCache();
  }, []);

  const handleHistoryPush = (q?: string) => {
    const v = showInput ? selectedQuerier?.config?.url || "" : ipSearchUrl;
    const url = v.startsWith("/") ? v : "/" + v;
    const to = url.replaceAll("%{q}%", q || searchKey || "");
    getHistory().push(to);
  };

  // istanbul ignore next
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKey(e.target.value);
  };

  // istanbul ignore next
  const handleClear = () => {
    setSearchKey("");
  };
  useEffect(() => {
    const handleClick = () => {
      if (showInput) {
        setShowInput(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const modKey = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
        ? "metaKey"
        : "ctrlKey";
      if (!showInput) {
        // istanbul ignore else
        if (checkIsDirectJump()) {
          handleHistoryPush();
        } else if (e[modKey] && e.key === "k") {
          setShowInput(true);
        }
      }
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showInput]);

  useEffect(() => {
    if (!querierList.length && showInput) {
      (async () => {
        const defaultQueriers = [
          {
            type: QuerierTypes.fullText,
            name: "全文搜索",
            config: {
              url: fullTextUrl,
            },
          },
          {
            type: QuerierTypes.ipSearch,
            name: "ip搜索",
            config: {
              url: ipSearchUrl,
            },
          },
        ];
        try {
          const queriers =
            (
              await InstanceApi_postSearchV3("QUERIER_CONFIG@EASYOPS", {
                page: 1,
                page_size: 100,
                fields: ["name", "type", "disabled", "config", "showInApps"],
              })
            ).list?.map((item) => {
              const i = item as Querier;

              const config: QuerierConfig = i.config || { url: "" };

              if (i.type === QuerierTypes.fullText) {
                config.url = fullTextUrl;
              } else if (i.type === QuerierTypes.ipSearch) {
                config.url = ipSearchUrl;
              }
              return { ...i, config };
            }) || defaultQueriers;
          setQuerierList(queriers as Querier[]);
        } catch {
          setQuerierList(defaultQueriers as Querier[]);
        }
      })();
    }
  }, [showInput]);

  useEffect(() => {
    const options = querierList
      .filter(
        (i) =>
          !i.disabled &&
          (!i.showInApps?.length ||
            (i.showInApps?.length && i.showInApps.includes(appId)))
      )
      .map((i) => ({ ...i, label: i.name, value: i.type }));
    setQuerierOptions(options);
    setSelectedQuerier(
      options.find((i) => i.type === QuerierTypes.ipSearch) || options[0]
    );
  }, [querierList]);

  // istanbul ignore next
  const handleQuerierSelect = (e: string) => {
    setSelectedQuerier(querierOptions.find((i) => i.type === e));
  };

  // istanbul ignore next
  const haneleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchKey) {
      storage.setItem(storageKey, uniq([searchKey, ...visits].slice(0, 5)));
      handleHistoryPush();
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm:
          /* istanbul ignore next */
          currentTheme === "dark-v2"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <StyleProvider container={shadowRoot as ShadowRoot} cache={cache}>
        <div style={{ position: "relative" }}>
          <div
            className={classNames("container", {
              containerShowInput: showInput,
              inputContentSlideout: showInput === false,
            })}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div
              className={classNames("inputContent", {
                inputContentSlidein: showInput,
                inputContentSlideout: showInput === false,
              })}
            >
              {
                <div className={classNames("input-addon-wrapper")}>
                  {
                    <span className="input-affix-wrapper">
                      <span className="input-before-addon">
                        <Select
                          value={selectedQuerier?.value}
                          getPopupContainer={(trigger) => trigger.parentElement}
                          showSearch
                          variant="borderless"
                          style={{ width: "150px" }}
                          options={querierOptions}
                          onChange={handleQuerierSelect}
                        ></Select>
                      </span>
                      <input
                        autoFocus
                        placeholder={
                          selectedQuerier?.config?.searchPlaceholder ||
                          (selectedQuerier?.type === QuerierTypes.ipSearch
                            ? "输入IP查询主机关联的应用、系统等资源"
                            : selectedQuerier?.type === QuerierTypes.fullText
                              ? '搜索应用、主机等信息，支持""精确搜索'
                              : "")
                        }
                        value={searchKey}
                        onChange={handleChange}
                        onKeyDown={haneleInputKeyDown}
                      />
                      {!!searchKey && (
                        <span className="input-suffix">
                          <WrappedIcon
                            className="input-clear-icon"
                            lib="antd"
                            icon="close-circle"
                            theme="filled"
                            onClick={handleClear}
                          />
                        </span>
                      )}
                    </span>
                  }
                </div>
              }
            </div>
            {!showInput && (
              <WrappedToolTip content="IP搜索">
                <WrappedButton
                  onClick={() => {
                    if (checkIsDirectJump()) {
                      handleHistoryPush();
                    } else {
                      setShowInput(true);
                    }
                  }}
                  className={classNames("button", {
                    buttonSildeint: showInput === false,
                  })}
                  shape="circle"
                  type="ghost"
                  buttonStyle={{
                    border: "none",
                    background: "none",
                    fontSize: "16px",
                  }}
                  icon={{ icon: "search", theme: "outlined", lib: "antd" }}
                ></WrappedButton>
              </WrappedToolTip>
            )}
          </div>
          {
            <div
              className={classNames("historySearchContainer", {
                historySearchContainerSlidein: showInput,
                historySearchContainerSlideout: showInput === false,
              })}
            >
              <div className="historySearchContent">
                <div className="latestSearchText">最近搜索</div>

                {visits.map((i) => (
                  <span
                    key={i}
                    className="latestSearchTagContent"
                    onClick={() => {
                      handleHistoryPush(i);
                    }}
                  >
                    <span className="latestSearchTagText">{i}</span>
                  </span>
                ))}
              </div>
              <div className="quickSearchTip">快捷搜索（Cmd/Ctrl+K）</div>
            </div>
          }
        </div>
      </StyleProvider>
    </ConfigProvider>
  );
}
