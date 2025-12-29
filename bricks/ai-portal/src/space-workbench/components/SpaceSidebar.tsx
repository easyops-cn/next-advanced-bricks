import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  useRef,
  forwardRef,
} from "react";
import classNames from "classnames";
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
  InstanceUpdateTrigger,
} from "../interfaces";
import { KnowledgesList } from "./knowLedgesList.js";
import { EmptyState } from "./EmptyState.js";
import { AddObjectInstModal } from "../components/AddObjectInstModal/AddObjectInstModal";
import { handleHttpError } from "@next-core/runtime";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export interface SpaceSidebarProps {
  businessObjects?: BusinessObjectGroup[];
  knowledgeList?: KnowledgeItem[];
  onInstanceClick?: (
    instance: BusinessInstance,
    businessObject: BusinessObject
  ) => void;
  onKnowledgeClick?: (knowledge: KnowledgeItem) => void;
  onKnowledgeAdd?: () => void;
  instanceUpdateTrigger?: InstanceUpdateTrigger;
}

export function SpaceSidebar(props: SpaceSidebarProps) {
  const {
    knowledgeList,
    onInstanceClick,
    onKnowledgeClick,
    onKnowledgeAdd,
    instanceUpdateTrigger,
  } = props;
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
          className={classNames(styles.tabButton, {
            [styles.active]: activeTab === "business",
          })}
          onClick={() => handleTabChange("business")}
        >
          {t(K.BUSINESS_OBJECTS)}
        </button>
        <button
          className={classNames(styles.tabButton, {
            [styles.active]: activeTab === "knowledge",
          })}
          onClick={() => handleTabChange("knowledge")}
        >
          {t(K.KNOWLEDGE)}
        </button>
      </div>

      <div className={styles.sidebarContent}>
        <div
          className={classNames(styles.tabContent, {
            [styles.tabContentActive]: activeTab === "business",
          })}
        >
          <BusinessCategoryPanel
            onInstanceClick={onInstanceClick}
            instanceUpdateTrigger={instanceUpdateTrigger}
          />
        </div>
        <div
          className={classNames(styles.tabContent, {
            [styles.tabContentActive]: activeTab === "knowledge",
          })}
        >
          <KnowledgesList
            knowledges={knowledgeList}
            onKnowledgeClick={onKnowledgeClick}
            onAddKnowledge={onKnowledgeAdd}
          />
        </div>
      </div>
    </div>
  );
}

interface BusinessObjectItemProps {
  businessObject: BusinessObject;
  activeInstanceId: string | null;
  defaultExpanded?: boolean;
  onInstanceClick: (
    instance: BusinessInstance,
    businessObject: BusinessObject
  ) => void;
  onAddClick: (e: React.MouseEvent, objectId: string) => void;
  getShowAttrIds: (objectId: string) => string[];
}

export interface BusinessObjectItemRef {
  refresh: () => Promise<void>;
  updateInstance: (
    instanceId: string,
    updatedData: Partial<BusinessInstance>
  ) => void;
}

const BusinessObjectItem = forwardRef<
  BusinessObjectItemRef,
  BusinessObjectItemProps
>(function BusinessObjectItem(
  {
    businessObject,
    activeInstanceId,
    defaultExpanded = false,
    onInstanceClick,
    onAddClick,
    getShowAttrIds,
  },
  ref
) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [instances, setInstances] = useState<BusinessInstance[]>([]);

  // 加载实例列表的核心函数
  const loadInstances = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const res = await ElevoObjectApi_listServiceObjectInstances(
        businessObject.objectId,
        { page: 1, pageSize: 3000 }
      );
      const data = res.list as BusinessInstance[];
      setInstances(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load instances:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [businessObject.objectId]);

  // 暴露给父组件的方法
  useImperativeHandle(
    ref,
    () => ({
      refresh: loadInstances,
      updateInstance: (
        instanceId: string,
        updatedData: Partial<BusinessInstance>
      ) => {
        setInstances((prevInstances) =>
          prevInstances.map((instance) =>
            instance.instanceId === instanceId
              ? { ...instance, ...updatedData }
              : instance
          )
        );
      },
    }),
    [loadInstances]
  );

  // 监听展开状态变化,展开时加载数据
  useEffect(() => {
    if (!isExpanded) return;

    // 如果已有数据(缓存),不重新加载
    if (instances.length > 0) {
      return;
    }

    // 首次展开,调用 API
    loadInstances();
  }, [isExpanded, instances.length, loadInstances]);

  // 切换展开/折叠
  const handleHeaderClick = () => {
    setIsExpanded(!isExpanded);
  };

  // 处理添加按钮点击
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddClick(e, businessObject.objectId);
  };

  // 处理实例点击
  const handleInstanceClick = (instance: BusinessInstance) => {
    onInstanceClick(instance, businessObject);
  };

  // 处理重试点击
  const handleRetryClick = () => {
    setHasError(false);
    loadInstances();
  };

  return (
    <div
      className={`${styles.objectGroup} ${isExpanded ? styles.expanded : ""}`}
    >
      <div className={styles.objectHeader} onClick={handleHeaderClick}>
        <span className={styles.objectName}>{businessObject.objectName}</span>
        <div className={styles.objectHeaderActions}>
          <WrappedIcon
            lib="lucide"
            icon="plus"
            className={styles.addIcon}
            onClick={handleAddClick}
          />
          <WrappedIcon
            lib="lucide"
            icon={isExpanded ? "chevron-down" : "chevron-right"}
            className={styles.expandIcon}
          />
        </div>
      </div>
      {isExpanded && (
        <div className={styles.instanceList}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <WrappedIcon
                lib="antd"
                icon="loading"
                theme="outlined"
                className={styles.loadingIcon}
              />
              <span className={styles.loadingText}>{t(K.LOADING)}</span>
            </div>
          ) : hasError ? (
            <div className={styles.errorContainer} onClick={handleRetryClick}>
              <span className={styles.errorText}>{t(K.LOAD_FAILED)}</span>
              <span className={styles.retryText}>{t(K.CLICK_TO_RETRY)}</span>
            </div>
          ) : instances.length === 0 ? (
            <div className={styles.emptyState}>{t(K.NO_INSTANCES)}</div>
          ) : (
            instances.map((instance) => (
              <div
                key={instance.instanceId}
                className={`${styles.instanceCard} ${
                  activeInstanceId === instance.instanceId ? styles.active : ""
                }`}
                onClick={() => handleInstanceClick(instance)}
              >
                <div className={styles.instanceHeader}>
                  <span className={styles.instanceName}>
                    {
                      instance?.[
                        getShowAttrIds(
                          businessObject.objectId
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
                {getShowAttrIds(businessObject.objectId)?.[1] && (
                  <div className={styles.instanceStatus}>
                    <span className={styles.statusTag}>
                      {
                        instance?.[
                          getShowAttrIds(
                            businessObject.objectId
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
  );
});

interface BusinessCategoryPanelProps {
  onInstanceClick?: (
    instance: BusinessInstance,
    businessObject: BusinessObject
  ) => void;
  instanceUpdateTrigger?: InstanceUpdateTrigger;
}

function BusinessCategoryPanel({
  onInstanceClick,
  instanceUpdateTrigger,
}: BusinessCategoryPanelProps) {
  const { spaceDetail } = useContext(WorkbenchContext);

  const [businessObjects, setBusinessObjects] = useState<BusinessObject[]>([]);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [activeInstanceId, setActiveInstanceId] = useState<string | null>(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedObject, setSelectedObject] = useState<BusinessObject | null>(
    null
  );

  // 用于存储子组件的 ref
  const businessObjectItemRefs = useRef<
    Record<string, BusinessObjectItemRef | null>
  >({});

  const handleInstanceClick = useCallback(
    (instance: BusinessInstance, businessObject: BusinessObject) => {
      setActiveInstanceId(instance.instanceId);
      onInstanceClick?.(instance, businessObject);
    },
    [onInstanceClick]
  );

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
      } catch (error) {
        handleHttpError(error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchBusinessFlows();
  }, [spaceDetail.instanceId]);

  const getShowAttrIds = useCallback(
    (objectId: string): string[] => {
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
    },
    [businessObjects]
  );

  const handleAddInstance = useCallback(
    (e: React.MouseEvent, objectId: string) => {
      e.stopPropagation();
      const obj = businessObjects.find((o) => o.objectId === objectId);
      if (obj) {
        setSelectedObject(obj);
        setAddModalVisible(true);
      }
    },
    [businessObjects]
  );

  const handleModalSuccess = useCallback(() => {
    setAddModalVisible(false);
    if (selectedObject) {
      // 调用子组件的 refresh 方法刷新实例列表
      businessObjectItemRefs.current[selectedObject.objectId]?.refresh();
    }
  }, [selectedObject]);

  const handleModalCancel = () => {
    setAddModalVisible(false);
    setSelectedObject(null);
  };

  // 监听外部的 instanceUpdateTrigger,调用子组件的 updateInstance 方法
  useEffect(() => {
    if (!instanceUpdateTrigger) return;

    const { objectId, instanceId, updatedData } = instanceUpdateTrigger;

    // 调用对应子组件的 updateInstance 方法
    businessObjectItemRefs.current[objectId]?.updateInstance(
      instanceId,
      updatedData
    );
  }, [instanceUpdateTrigger]);

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
    return <EmptyState title={t(K.NO_BUSINESS_OBJECTS)} />;
  }

  return (
    <>
      <div className={styles.businessObjectList}>
        {businessObjects.map((obj, index) => (
          <BusinessObjectItem
            key={obj.objectId}
            ref={(ref) => (businessObjectItemRefs.current[obj.objectId] = ref)}
            businessObject={obj}
            activeInstanceId={activeInstanceId}
            defaultExpanded={index === 0} // 第一个对象默认展开
            onInstanceClick={handleInstanceClick}
            onAddClick={handleAddInstance}
            getShowAttrIds={getShowAttrIds}
          />
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
