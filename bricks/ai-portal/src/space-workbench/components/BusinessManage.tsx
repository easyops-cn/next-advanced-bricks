import React, { useState, useEffect } from "react";
import classNames from "classnames";
import type { ViewType } from "../interfaces";
import { ConfigPreview } from "./ConfigPreview";
import { SpaceConfigSchema, BusinessObject, BusinessFlow } from "../interfaces";
import styles from "./BusinessManage.module.css";
import { EmptyState } from "./EmptyState";

interface CardItem {
  id: string;
  name: string;
  description: string;
}

export enum TabType {
  BUSINESS_OBJECTS = "businessObjects",
  BUSINESS_FLOWS = "businessFlows",
}

interface BusinessManageProps {
  configSchema: SpaceConfigSchema;
}

/**
 * 业务管理组件
 * 包含业务对象/业务流列表区域和配置详情预览区域
 */
export function BusinessManage({
  configSchema,
}: BusinessManageProps): React.ReactElement {
  // 当前激活的 Tab
  const [activeTab, setActiveTab] = useState<TabType>(TabType.BUSINESS_OBJECTS);
  // 当前选中的配置项
  const [selectedItem, setSelectedItem] = useState<
    BusinessObject | BusinessFlow
  >();
  // 视图类型: visual 或 json
  const [viewType, setViewType] = useState<ViewType>("visual");

  // 统一处理 selectedItem 的更新：当 configSchema 或 activeTab 变化时自动更新
  useEffect(() => {
    const currentList =
      activeTab === TabType.BUSINESS_OBJECTS
        ? configSchema?.businessObjects
        : configSchema?.businessFlows;

    if (!currentList || currentList.length === 0) {
      setSelectedItem(undefined);
      return;
    }

    // 使用函数式更新，避免循环依赖
    setSelectedItem((prevItem) => {
      // 如果当前有选中的项，尝试在新数据中找到对应的项
      if (prevItem) {
        const getItemId = (item: BusinessObject | BusinessFlow): string => {
          return activeTab === TabType.BUSINESS_OBJECTS
            ? (item as BusinessObject).objectId
            : (item as BusinessFlow).instanceId;
        };
        const currentId = getItemId(prevItem);
        const matchedItem = currentList.find(
          (item) => getItemId(item) === currentId
        );
        // 找到了对应的项，返回新数据中的项；否则返回第一项
        return matchedItem || currentList[0];
      }
      // 当前没有选中项，返回第一项
      return currentList[0];
    });
  }, [configSchema, activeTab]);

  // 处理 Tab 切换（selectedItem 的更新由 useEffect 自动处理）
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // 处理列表项选中
  const handleItemSelect = (item: CardItem) => {
    const selectedItem = configSchema?.[activeTab as TabType]?.find(
      (row) =>
        item.id ===
        (activeTab === TabType.BUSINESS_OBJECTS
          ? (row as BusinessObject).objectId
          : (row as BusinessFlow).instanceId)
    );
    setSelectedItem(selectedItem);
  };

  // 判断是业务对象还是业务流
  const isBusinessObject = activeTab === TabType.BUSINESS_OBJECTS;

  return (
    <>
      {/* 中间: 业务对象/业务流列表区域 */}
      <div className={styles.configListArea}>
        <div className={styles.configListTabs}>
          <button
            className={classNames(styles.configListTab, {
              [styles.active]: activeTab === TabType.BUSINESS_OBJECTS,
            })}
            onClick={() => handleTabChange(TabType.BUSINESS_OBJECTS)}
          >
            业务对象
          </button>
          <button
            className={classNames(styles.configListTab, {
              [styles.active]: activeTab === TabType.BUSINESS_FLOWS,
            })}
            onClick={() => handleTabChange(TabType.BUSINESS_FLOWS)}
          >
            业务流
          </button>
        </div>

        {activeTab === TabType.BUSINESS_OBJECTS ? (
          <BusinessCardList
            itemList={configSchema?.businessObjects?.map((item) => ({
              id: item.objectId,
              name: item.objectName,
              description: item.description,
            }))}
            activeId={(selectedItem as BusinessObject)?.objectId}
            onItemClick={handleItemSelect}
          />
        ) : (
          <BusinessCardList
            itemList={configSchema?.businessFlows?.map((item) => ({
              id: item.instanceId,
              name: item.name,
              description: item.description,
            }))}
            activeId={(selectedItem as BusinessFlow)?.instanceId}
            onItemClick={handleItemSelect}
          />
        )}
      </div>

      {/* 右侧: 配置详情预览区域 */}
      <div className={styles.configPreviewArea}>
        <ConfigPreview
          businessObject={
            isBusinessObject ? (selectedItem as BusinessObject) : null
          }
          businessFlow={
            !isBusinessObject ? (selectedItem as BusinessFlow) : null
          }
          viewType={viewType}
          onViewTypeChange={setViewType}
        />
      </div>
    </>
  );
}

interface BusinessCardListProps {
  itemList: CardItem[];
  activeId?: string;
  onItemClick?: (item: CardItem) => void;
}

function BusinessCardList({
  itemList,
  activeId,
  onItemClick,
}: BusinessCardListProps): React.ReactElement {
  if (!itemList?.length) {
    return (
      <EmptyState
        title="暂无业务对象/业务流"
        description="请通过左侧对话引导 AI 生成配置"
      />
    );
  }
  return (
    <div className={styles.cardList}>
      {itemList?.map((item) => (
        <div
          key={item.id}
          className={classNames(styles.cardItem, {
            [styles.active]: activeId === item.id,
          })}
          onClick={() => onItemClick?.(item)}
        >
          <div className={styles.cardItemName} title={item.name}>
            {item.name}
          </div>
          <div className={styles.cardItemDesc} title={item.description}>
            {item.description}
          </div>
        </div>
      ))}
    </div>
  );
}
