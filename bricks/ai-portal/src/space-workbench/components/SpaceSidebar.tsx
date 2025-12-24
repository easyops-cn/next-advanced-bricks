import React, { useContext, useEffect, useState } from "react";
import { wrapBrick } from "@next-core/react-element";
import moment from "moment";
import {
  ElevoObjectApi_listServiceObjectInstances,
  ElevoObjectApi_listServiceObjects,
} from "@next-api-sdk/llm-sdk";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { humanizeTime, HumanizeTimeFormat } from "@next-shared/datetime";

import styles from "./SpaceSidebar.module.css";
import { K, t } from "../i18n.js";
import { WorkbenchContext } from "../workbenchContext";
import {
  BusinessObject,
  BusinessInstance,
  BusinessObjectGroup,
  KnowledgeItem,
} from "../interfaces";
import { KnowledgesList } from "./knowLedgesList.js";
import { AddObjectInstModal } from "../components/AddObjectInstModal/AddObjectInstModal";
import { handleHttpError } from "@next-core/runtime";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export interface SpaceSidebarProps {
  businessObjects?: BusinessObjectGroup[];
  knowledgeList?: KnowledgeItem[];
  onInstanceClick?: (instance: BusinessInstance) => void;
  onKnowledgeClick?: (knowledge: KnowledgeItem) => void;
  onKnowledgeAdd?: () => void;
}

export function SpaceSidebar(props: SpaceSidebarProps) {
  const { knowledgeList, onInstanceClick, onKnowledgeClick, onKnowledgeAdd } =
    props;
  const [activeTab, setActiveTab] = useState<"business" | "knowledge">(
    "business"
  );

  const handleTabChange = (tab: "business" | "knowledge") => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.spaceSidebar}>
      <div className={styles.tabList}>
        <button
          className={`${styles.tabButton} ${activeTab === "business" ? styles.active : ""}`}
          onClick={() => handleTabChange("business")}
        >
          {t(K.BUSINESS_OBJECTS)}
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "knowledge" ? styles.active : ""}`}
          onClick={() => handleTabChange("knowledge")}
        >
          {t(K.KNOWLEDGE)}
        </button>
      </div>

      <div className={styles.sidebarContent}>
        {activeTab === "business" ? (
          <BusinessCategoryPanel onInstanceClick={onInstanceClick} />
        ) : (
          <KnowledgesList
            knowledges={knowledgeList}
            onKnowledgeClick={onKnowledgeClick}
            onAddKnowledge={onKnowledgeAdd}
          />
        )}
      </div>
    </div>
  );
}

interface BusinessCategoryPanelProps {
  onInstanceClick?: (instance: BusinessInstance) => void;
}

function BusinessCategoryPanel({
  onInstanceClick,
}: BusinessCategoryPanelProps) {
  const { spaceDetail } = useContext(WorkbenchContext);

  const [businessObjects, setBusinessObjects] = useState<BusinessObject[]>([]);

  const [activeObjectId, setActiveObjectId] = useState<string | null>(null);

  const [objectInstancesMap, setObjectInstancesMap] = useState<
    Record<string, BusinessInstance[]>
  >({});

  const [loadingObjectId, setLoadingObjectId] = useState<string | null>(null);

  const [errorObjectId, setErrorObjectId] = useState<string | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedObject, setSelectedObject] = useState<BusinessObject | null>(
    null
  );

  const handleObjectToggle = async (objectId: string) => {
    // 如果点击的是当前展开的分类,则折叠它
    if (activeObjectId === objectId) {
      setActiveObjectId(null);
      return;
    }

    // 展开新分类
    setActiveObjectId(objectId);

    // 如果已经有缓存数据,直接显示
    if (objectInstancesMap[objectId]) {
      return;
    }

    // 开始加载数据
    setLoadingObjectId(objectId);
    setErrorObjectId(null);

    try {
      const instances = await ElevoObjectApi_listServiceObjectInstances(
        objectId,
        { page: 1, pageSize: 3000 }
      );
      setObjectInstancesMap((prev) => ({
        ...prev,
        [objectId]: instances.list as BusinessInstance[],
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load instances:", error);
      setErrorObjectId(objectId);
    } finally {
      setLoadingObjectId(null);
    }
  };

  const handleInstanceClick = (instance: BusinessInstance) => {
    onInstanceClick?.(instance);
  };

  useEffect(() => {
    const fetchBusinessFlows = async () => {
      setIsInitialLoading(true);
      try {
        const res = await ElevoObjectApi_listServiceObjects(
          spaceDetail.instanceId,
          {
            includeDetails: true,
          }
        );
        setBusinessObjects(res.list as BusinessObject[]);

        // 默认展开第一个分类并加载数据
        const firstObjectId = res.list[0]?.objectId;
        if (firstObjectId) {
          setActiveObjectId(firstObjectId);
          setLoadingObjectId(firstObjectId);

          try {
            const instances = await ElevoObjectApi_listServiceObjectInstances(
              firstObjectId,
              { page: 1, pageSize: 3000 }
            );
            setObjectInstancesMap({
              [firstObjectId]: instances.list as BusinessInstance[],
            });
          } catch (_error) {
            setErrorObjectId(firstObjectId);
          } finally {
            setLoadingObjectId(null);
          }
        }
      } catch (error) {
        handleHttpError(error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchBusinessFlows();
  }, [spaceDetail.instanceId]);

  const getShowAttrIds = (objectId: string): string[] => {
    const attrs = businessObjects.find(
      (item) => item.objectId === objectId
    )?.attributes;

    if (attrs?.length) {
      return [
        attrs[0].id, // 拿第一个属性作为主展示名称
        attrs.find((item) => item.id === "status")?.id, // 拿状态列作为副展示信息
      ].filter(Boolean) as string[];
    }

    return [];
  };

  const handleAddInstance = (e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    const obj = businessObjects.find((o) => o.objectId === objectId);
    if (obj) {
      setSelectedObject(obj);
      setAddModalVisible(true);
    }
  };

  const handleModalSuccess = async () => {
    setAddModalVisible(false);
    // 刷新当前对象的实例列表
    if (activeObjectId) {
      setLoadingObjectId(activeObjectId);
      try {
        const instances = await ElevoObjectApi_listServiceObjectInstances(
          activeObjectId,
          { page: 1, pageSize: 3000 }
        );
        setObjectInstancesMap((prev) => ({
          ...prev,
          [activeObjectId]: instances.list as BusinessInstance[],
        }));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to refresh instances:", error);
      } finally {
        setLoadingObjectId(null);
      }
    }
  };

  const handleModalCancel = () => {
    setAddModalVisible(false);
    setSelectedObject(null);
  };

  if (isInitialLoading) {
    return (
      <div className={styles.knowledgeList}>
        <div className={styles.loadingContainer}>
          <WrappedIcon
            lib="antd"
            icon="loading"
            theme="outlined"
            className={styles.loadingIcon}
          />
          <span className={styles.loadingText}>{t(K.LOADING)}</span>
        </div>
      </div>
    );
  }

  if (!businessObjects?.length) {
    return (
      <div className={styles.knowledgeList}>
        <div className={styles.emptyState}>{t(K.NO_BUSINESS_OBJECTS)}</div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.businessObjectList}>
        {businessObjects.map((obj) => (
          <div
            key={obj.objectId}
            className={`${styles.objectGroup} ${activeObjectId === obj.objectId ? styles.expanded : ""}`}
          >
            <div
              className={styles.objectHeader}
              onClick={() => handleObjectToggle(obj.objectId)}
            >
              <span className={styles.objectName}>{obj.objectName}</span>
              <div className={styles.objectHeaderActions}>
                <WrappedIcon
                  lib="lucide"
                  icon="plus"
                  className={styles.addIcon}
                  onClick={(e) => handleAddInstance(e, obj.objectId)}
                />
                <WrappedIcon
                  lib="lucide"
                  icon={
                    activeObjectId === obj.objectId
                      ? "chevron-down"
                      : "chevron-right"
                  }
                  className={styles.expandIcon}
                />
              </div>
            </div>
            {activeObjectId === obj.objectId && (
              <div className={styles.instanceList}>
                {loadingObjectId === obj.objectId ? (
                  <div className={styles.loadingContainer}>
                    <WrappedIcon
                      lib="antd"
                      icon="loading"
                      theme="outlined"
                      className={styles.loadingIcon}
                    />
                    <span className={styles.loadingText}>{t(K.LOADING)}</span>
                  </div>
                ) : errorObjectId === obj.objectId ? (
                  <div
                    className={styles.errorContainer}
                    onClick={() => handleObjectToggle(obj.objectId)}
                  >
                    <span className={styles.errorText}>{t(K.LOAD_FAILED)}</span>
                    <span className={styles.retryText}>
                      {t(K.CLICK_TO_RETRY)}
                    </span>
                  </div>
                ) : objectInstancesMap[obj.objectId]?.length === 0 ? (
                  <div className={styles.emptyState}>{t(K.NO_INSTANCES)}</div>
                ) : (
                  objectInstancesMap[obj.objectId]?.map((instance) => (
                    <div
                      key={instance.instanceId}
                      className={styles.instanceCard}
                      onClick={() => handleInstanceClick(instance)}
                    >
                      <div className={styles.instanceHeader}>
                        <span className={styles.instanceName}>
                          {
                            instance?.[
                              getShowAttrIds(
                                obj.objectId
                              )?.[0] as keyof BusinessInstance
                            ]
                          }
                        </span>
                        <span className={styles.instanceTime}>
                          {humanizeTime(
                            moment(
                              instance.ctime || instance.mtime,
                              "YYYY-MM-DD HH:mm:ss"
                            ).valueOf(),
                            HumanizeTimeFormat.relative
                          )}
                        </span>
                      </div>
                      {getShowAttrIds(obj.objectId)?.[1] && (
                        <div className={styles.instanceStatus}>
                          <span className={styles.statusTag}>
                            {
                              instance?.[
                                getShowAttrIds(
                                  obj.objectId
                                )[1] as keyof BusinessInstance
                              ]
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedObject && (
        <AddObjectInstModal
          visible={addModalVisible}
          spaceDetail={spaceDetail}
          businessObject={selectedObject}
          onSuccess={handleModalSuccess}
          onCancel={handleModalCancel}
        />
      )}
    </>
  );
}
