import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { NS, locales, K, t } from "./i18n.js";
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

import { getRuntime, getHistory } from "@next-core/runtime";
import { JsonStorage } from "@next-shared/general/JsonStorage";
import { auth } from "@next-core/easyops-runtime";
import { uniq } from "lodash";
import { Select, ConfigProvider, theme } from "antd";
import { StyleProvider, createCache } from "@ant-design/cssinjs";
import { InstanceApi_postSearchV3 } from "@next-api-sdk/cmdb-sdk";
import type { EoTooltip, ToolTipProps } from "@next-bricks/basic/tooltip";
import { useCurrentTheme } from "@next-core/react-runtime";

initializeI18n(NS, locales);

const { defineElement } = createDecorators();

// --- 常量定义 ---
const STORAGE = new JsonStorage(localStorage);
const FULL_TEXT_URL = "search/result?q=%{q}%";
const IP_SEARCH_URL = "search/new/ipSearch?q=%{q}%";
const ITSM_SEARCH_URL = "/itsc-ticket-center/ticket-list?q=%{q}%";
const INSTANCE_SEARCH_URL = "search/instance-or-relation-path/search/";

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
  instanceId?: string;
  config: QuerierConfig;
}

interface QuerierOption extends Querier {
  label: string;
  value: string;
}

// 获取 Storage Key 的辅助函数
const getOrgId = () => (auth.getAuth() as Record<string, string>)?.org || "";
const getRecentVisitsKey = () => `querier-search-recent-visits:${getOrgId()}`;
const getSelectedQuerierKey = () => `querier-search-querier:${getOrgId()}`;

export function QuerySearchComponent(props: QuerySearchComponentProps) {
  const { shadowRoot } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const appId = getRuntime().getCurrentApp()?.id || "";
  const currentTheme = useCurrentTheme();

  // State
  /**
   * null: 初始化（无动画）
   * false: 收起（播放收起动画）
   * true: 展开
   */
  const [showInput, setShowInput] = useState<boolean | null>(null);
  const [searchKey, setSearchKey] = useState<string>("");
  const [visits, setVisits] = useState<string[]>([]);

  // Data State
  const [querierList, setQuerierList] = useState<Querier[]>([]);
  const [querierOptions, setQuerierOptions] = useState<QuerierOption[]>([]);
  const [selectedQuerier, setSelectedQuerier] = useState<QuerierOption>();

  // Style Cache
  const cache = useMemo(() => createCache(), []);

  // 检测是否应该直接跳转 (响应式布局逻辑)
  const checkIsDirectJump = useCallback((): boolean => {
    const parentWidth = shadowRoot?.host?.parentElement?.clientWidth || 0;
    return document.documentElement.clientWidth - parentWidth - 500 < 200;
  }, [shadowRoot]);

  // 处理跳转逻辑
  const handleHistoryPush = useCallback(
    (q?: string) => {
      // 如果还没加载 querier，默认去 IP 搜索
      const targetUrl =
        showInput && selectedQuerier?.config?.url
          ? selectedQuerier.config.url
          : IP_SEARCH_URL;
      const cleanUrl = targetUrl.startsWith("/") ? targetUrl : "/" + targetUrl;
      const queryTerm = q || searchKey || "";
      const to = cleanUrl.replaceAll("%{q}%", queryTerm);
      getHistory().push(to);
    },
    [showInput, selectedQuerier, searchKey]
  );

  // --- 核心逻辑优化 1: 分离键盘事件监听 ---

  // 1.1 全局快捷键监听 (Cmd/Ctrl + K) - 只绑定一次
  // istanbul ignore next
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key === "k") {
        e.preventDefault();
        // 使用 functional update 获取最新状态，避免频繁解绑
        setShowInput((prevShow) => {
          if (!prevShow) {
            // 如果当前是关闭状态，检查是否直接跳转
            if (checkIsDirectJump()) {
              // 注意：这里可能取不到最新的 selectedQuerier，如果依赖它，需要调整逻辑
              // 但 checkIsDirectJump 路径下通常走 IP Search 或默认
              // 为简化，此处仅触发打开，或需将 historyPush 移出 effect
              // *修正*: 为了保持原逻辑，这里若 directJump 为 true，我们在 state 变化副作用里处理，或者简单地只设为 true
              // 原逻辑是: 没 showInput -> directJump ? jump : show
              return true;
            }
            return true;
          }
          return prevShow;
        });

        // 特殊处理 DirectJump: 如果变为 true 后需要立即跳转，
        // 最好是在点击 button 时判断。快捷键场景下，先打开 Input 也是合理的交互。
        // 如果严格遵循原逻辑，需要在 effect 外部处理 jump。
        if (checkIsDirectJump() && !showInput) {
          // 这里 showInput 是闭包旧值，需小心
          handleHistoryPush();
          setShowInput(false); // 保持关闭
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [checkIsDirectJump, handleHistoryPush]); // 依赖项较少

  // 1.2 局部交互监听 (点击外部关闭, ESC) - 仅当 showInput 为 true 时生效
  // istanbul ignore next
  useEffect(() => {
    if (!showInput) return;

    // 自动聚焦
    inputRef.current?.focus();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !e.composedPath().includes(containerRef.current)
      ) {
        setShowInput(false);
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        setShowInput(false);
      }
    };

    // 关键修复：添加时使用了 capture: true
    window.addEventListener("click", handleClickOutside, true);
    window.addEventListener("keydown", handleEscKey);

    return () => {
      // 关键修复：移除时必须保持 capture: true，否则无法移除
      window.removeEventListener("click", handleClickOutside, true);
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [showInput]);

  // --- 核心逻辑优化 2: 数据获取 (Lazy Loading) ---

  useEffect(() => {
    // 只有在打开输入框且列表为空时才加载
    if (showInput && querierList.length === 0) {
      const fetchQueriers = async () => {
        const defaultQueriers: Querier[] = [
          {
            type: QuerierTypes.fullText,
            name: t(K.FULL_TEXT_SEARCH),
            disabled: false,
            showInApps: [],
            config: { url: FULL_TEXT_URL, searchPlaceholder: "" },
          },
          {
            type: QuerierTypes.ipSearch,
            name: t(K.IP_SEARCH),
            disabled: false,
            showInApps: [],
            config: { url: IP_SEARCH_URL, searchPlaceholder: "" },
          },
          {
            type: QuerierTypes.link,
            name: t(K.TICKET_SEARCH),
            disabled: false,
            showInApps: [],
            config: {
              url: ITSM_SEARCH_URL,
              searchPlaceholder: t(K.TICKET_SEARCH_PLACEHOLDER),
            },
          },
        ];

        try {
          const res = await InstanceApi_postSearchV3("QUERIER_CONFIG@EASYOPS", {
            page: 1,
            page_size: 100,
            fields: ["name", "type", "disabled", "config", "showInApps"],
          });

          const apiQueriers =
            res.list?.map((item) => {
              const i = item as Querier;
              const config: QuerierConfig = i.config || {
                url: "",
                searchPlaceholder: "",
              };

              if (i.type === QuerierTypes.fullText) config.url = FULL_TEXT_URL;
              else if (i.type === QuerierTypes.ipSearch)
                config.url = IP_SEARCH_URL;
              else if (
                [
                  QuerierTypes.instanceSearch,
                  QuerierTypes.relationSearch,
                ].includes(i.type)
              ) {
                config.url = `${INSTANCE_SEARCH_URL}${i.name}?q=%{q}%`;
              }
              return { ...i, config };
            }) || [];

          setQuerierList(
            apiQueriers.length > 0 ? apiQueriers : defaultQueriers
          );
        } catch {
          setQuerierList(defaultQueriers);
        }
      };
      fetchQueriers();
    }
  }, [showInput, querierList.length]);

  // --- 逻辑优化 3: 选项过滤与选中状态 ---

  useEffect(() => {
    if (querierList.length === 0) return;

    const options = querierList
      .filter(
        (i) =>
          !i.disabled && (!i.showInApps?.length || i.showInApps.includes(appId))
      )
      .map((i) => ({ ...i, label: i.name, value: i.name }));

    setQuerierOptions(options);

    // 恢复上次选中的 Querier
    const lastSelectedName = STORAGE.getItem(getSelectedQuerierKey());
    const matched = options.find((i) => i.name === lastSelectedName);
    const defaultOption =
      options.find((i) => i.type === QuerierTypes.ipSearch) || options[0];

    setSelectedQuerier(matched || defaultOption);
  }, [querierList, appId]);

  // 读取历史记录
  useEffect(() => {
    if (selectedQuerier) {
      const historyKey = `${getRecentVisitsKey()}-${selectedQuerier.name}`;
      setVisits(STORAGE.getItem(historyKey) ?? []);
    }
  }, [selectedQuerier]);

  // --- 事件处理 ---

  const handleQuerierSelect = (val: string) => {
    STORAGE.setItem(getSelectedQuerierKey(), val);
    setSelectedQuerier(querierOptions.find((i) => i.name === val));
  };
  // istanbul ignore next
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchKey && selectedQuerier) {
      const historyKey = `${getRecentVisitsKey()}-${selectedQuerier.name}`;
      STORAGE.setItem(historyKey, uniq([searchKey, ...visits].slice(0, 5)));
      handleHistoryPush();
    }
  };

  const handleClear = () => setSearchKey("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchKey(e.target.value);

  const handleSearchClick = () => {
    if (checkIsDirectJump()) {
      handleHistoryPush();
    } else {
      setShowInput(true);
    }
  };
  // istanbul ignore next
  const handleHistoryTagClick = (tag: string) => {
    if (selectedQuerier) {
      const historyKey = `${getRecentVisitsKey()}-${selectedQuerier.name}`;
      STORAGE.setItem(historyKey, uniq([tag, ...visits].slice(0, 5)));
      handleHistoryPush(tag);
    }
  };

  // 计算 Placeholder
  const getPlaceholder = () => {
    if (selectedQuerier?.config?.searchPlaceholder)
      return selectedQuerier.config.searchPlaceholder;
    if (selectedQuerier?.type === QuerierTypes.ipSearch)
      return t(K.IP_SEARCH_PLACEHOLDER);
    if (selectedQuerier?.type === QuerierTypes.fullText)
      return t(K.FULL_TEXT_SEARCH_PLACEHOLDER);
    return "";
  };

  return (
    <ConfigProvider
      theme={{
        algorithm:
          currentTheme === "dark-v2"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <StyleProvider
        container={shadowRoot as ShadowRoot}
        cache={cache}
        hashPriority="high"
      >
        <div style={{ position: "relative" }} ref={containerRef}>
          <div
            className={classNames("container", {
              containerShowInput: showInput,
              inputContentSlideout: showInput === false,
            })}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={classNames("inputContent", {
                inputContentSlidein: showInput,
                inputContentSlideout: showInput === false,
              })}
            >
              <div className="input-addon-wrapper">
                <span className="input-affix-wrapper">
                  <span className="input-before-addon">
                    <Select
                      value={selectedQuerier?.value}
                      getPopupContainer={(trigger) => trigger.parentElement}
                      showSearch
                      variant="borderless"
                      style={{ width: "100px" }}
                      options={querierOptions}
                      onChange={handleQuerierSelect}
                    />
                  </span>
                  <input
                    placeholder={getPlaceholder()}
                    ref={inputRef}
                    value={searchKey}
                    onChange={handleChange}
                    onKeyDown={handleInputKeyDown}
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
              </div>
            </div>

            {!showInput && (
              <WrappedToolTip content={t(K.IP_SEARCH_TOOLTIP)} placement="left">
                <WrappedButton
                  onClick={handleSearchClick}
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
                />
              </WrappedToolTip>
            )}
          </div>

          <div
            className={classNames("historySearchContainer", {
              historySearchContainerSlidein: showInput,
              historySearchContainerSlideout: showInput === false,
            })}
          >
            <div className="historySearchContent">
              <div className="latestSearchText">{t(K.RECENT_SEARCH)}</div>
              <div className="latestSearchTagContainer">
                {visits.map((i) => (
                  <span
                    key={i}
                    className="latestSearchTagContent"
                    onClick={() => handleHistoryTagClick(i)}
                  >
                    <span className="latestSearchTagText" title={i}>
                      {i}
                    </span>
                  </span>
                ))}
                {!visits.length && (
                  <div className="emptyText">{t(K.NO_SEARCH_HISTORY)}</div>
                )}
              </div>
            </div>
            <div className="quickSearchTip">{t(K.QUICK_SEARCH_TIP)}</div>
          </div>
        </div>
      </StyleProvider>
    </ConfigProvider>
  );
}
