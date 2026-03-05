import React, { useMemo, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import classNames from "classnames";
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
import type {
  StickyContainer,
  StickyContainerProps,
} from "../sticky-container/index.js";

initializeI18n(NS, locales);

const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");
const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedTabList = wrapBrick<
  TabList,
  TabListProps,
  TabListEvents,
  TabListMapping
>("ai-portal.tab-list", {
  onTabClick: "tab.click",
});
const WrappedStickyContainer = wrapBrick<StickyContainer, StickyContainerProps>(
  "ai-portal.sticky-container"
);

const { defineElement, property } = createDecorators();

export interface AIEmployeesProps {
  list?: Employee[];
  industries?: string[];
  // roles?: string[];
  urlTemplate?: string;
  stickyTop?: number;
}

export interface Employee {
  name: string;
  industry: string;
  role: string;
  description: string;
  avatar?: string;
}

/**
 * AI 数字人卡片列表，按行业和角色分组展示，支持 Tab 切换行业和点击跳转。
 *
 * @description AI 数字人卡片列表，按行业和角色分组展示，支持 Tab 切换行业和点击跳转。
 * @category ai-portal
 */
export
@defineElement("ai-portal.ai-employees", {
  styleTexts: [styleText],
})
class AIEmployees extends ReactNextElement implements AIEmployeesProps {
  /**
   * 数字人列表数据
   */
  @property({ attribute: false })
  accessor list: Employee[] | undefined;

  /**
   * 行业列表，用于指定 Tab 的顺序，未在此列表中的行业将按出现顺序附加在末尾
   */
  @property({ attribute: false })
  accessor industries: string[] | undefined;

  /**
   * 跳转到数字人详情页的 URL 模板，支持 {name} 等数字人字段插值
   */
  @property()
  accessor urlTemplate: string | undefined;

  /**
   * 行业 Tab 栏吸顶时距顶部的距离（px），不设置则不吸顶
   */
  @property({ type: Number })
  accessor stickyTop: number | undefined;

  render() {
    return (
      <AIEmployeesComponent
        list={this.list}
        industries={this.industries}
        urlTemplate={this.urlTemplate}
        stickyTop={this.stickyTop}
      />
    );
  }
}

function AIEmployeesComponent({
  list,
  industries: _industries,
  urlTemplate,
  stickyTop,
}: AIEmployeesProps) {
  const industries = useMemo(() => {
    return [
      ...new Set([
        ...(_industries ?? []),
        ...(list ?? []).map((item) => item.industry),
      ]),
    ];
  }, [_industries, list]);

  const [activeIndustry, setActiveIndustry] = useState(industries[0]);

  // Grouping the list by role
  const groups = useMemo(() => {
    const map = new Map<string, Employee[]>();
    list?.forEach((item) => {
      if (item.industry !== activeIndustry) {
        return;
      }
      let array = map.get(item.role);
      if (!array) {
        map.set(item.role, (array = []));
      }
      array.push(item);
    });
    return [...map.entries()];
  }, [activeIndustry, list]);

  const tabs = useMemo<Tab[]>(() => {
    return industries.map((industry) => ({
      id: industry,
      label: industry || t(K.UNTITLED),
    }));
  }, [industries]);

  const tabsNode = (
    <WrappedTabList
      tabs={tabs}
      activeTab={activeIndustry}
      onTabClick={(event) => setActiveIndustry(event.detail.id)}
    />
  );

  return (
    <>
      {stickyTop == null ? (
        <div className="non-sticky-tabs">{tabsNode}</div>
      ) : (
        <WrappedStickyContainer
          className="sticky-tabs"
          style={{ top: stickyTop }}
        >
          {tabsNode}
        </WrappedStickyContainer>
      )}
      <ul className="groups">
        {groups.map(([groupName, items]) => (
          <li key={groupName} className="group">
            <h2>{groupName}</h2>
            <ul className="list">
              {items.map((item, index) => (
                <li key={index}>
                  <WrappedLink
                    className={classNames("link", { clickable: !!urlTemplate })}
                    {...(urlTemplate
                      ? { url: parseTemplate(urlTemplate, item) }
                      : null)}
                  >
                    <div className="heading">
                      <div className="avatar">
                        {item.avatar ? (
                          <img src={item.avatar} />
                        ) : (
                          <WrappedIcon lib="antd" icon="user" />
                        )}
                      </div>
                      <div className="title">{item.name}</div>
                    </div>
                    <div className="description">{item.description}</div>
                  </WrappedLink>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}
