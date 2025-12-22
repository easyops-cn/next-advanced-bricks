import React, { useState, useContext, useRef } from "react";

import { ActivityCard } from "./ActivityCard";
import { WrappedIcon } from "../../shared/bricks";
import styles from "./BusinessFlowPreview.module.css";
import { BusinessFlow, Activity, ViewType } from "../interfaces";
import { wrapBrick } from "@next-core/react-element";
import type {
  MarkdownDisplayProps,
  MarkdownDisplay,
} from "@next-bricks/markdown/markdown-display";
import { ActivityDetailModal } from "./ActivityDetailModal";
import { ConfigContext } from "./SpaceConfigModal/ConfigContext";
import { K, t } from "../i18n.js";

const WrappedMarkdownDisplay = wrapBrick<MarkdownDisplay, MarkdownDisplayProps>(
  "eo-markdown-display"
);

export interface BusinessFlowPreviewProps {
  data?: BusinessFlow;
  viewType?: ViewType;
  onActivityClick?: (activity: Activity) => void;
}

/**
 * 业务流预览组件
 * 参考设计图: node-id=125-2527
 * 展示业务流的标题、先决条件和按阶段分组的活动列表
 */
export function BusinessFlowPreview({
  data,
  viewType = "visual",
}: BusinessFlowPreviewProps): React.ReactElement | null {
  // 活动详情模态框状态
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const { modifyActivity } = useContext(ConfigContext);

  const currentStage = useRef<string>();

  const handleActivityClick = (activity: Activity, stageName: string) => {
    currentStage.current = stageName;
    setSelectedActivity(activity);
  };

  const handleCloseActivityDetail = () => {
    setSelectedActivity(null);
  };

  if (!data) {
    return null;
  }

  // JSON 视图
  if (viewType === "json") {
    return (
      <div className={styles.jsonView}>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  // Visual 视图
  return (
    <>
      <div className={styles.businessFlowPreview}>
        {/* 标题区域 */}
        <div className={styles.flowHeader}>
          <div className={styles.flowTitleArea}>
            <div className={styles.flowTitle}>{data.name}</div>
            <div className={styles.flowDescription}>{data.description}</div>
          </div>
        </div>

        {/* 先决条件 */}
        {data.prerequisite && (
          <div className={styles.flowSection}>
            <div className={styles.sectionTitle}>
              <WrappedIcon
                lib="antd"
                icon="filter"
                className={styles.prerequisitesIcon}
              />
              <span>{t(K.PREREQUISITES)}</span>
            </div>
            <div className={styles.prerequisitesSubtitle}>
              {t(K.PREREQUISITES_SUBTITLE)}
            </div>
            <div className={styles.prerequisitesList}>
              <WrappedMarkdownDisplay content={data.prerequisite} />
            </div>
          </div>
        )}

        {!!data.spec?.length && (
          <div className={styles.flowSection}>
            {/* 活动卡片区域（包含步骤条） */}
            <div className={styles.stagesContainer}>
              {data.spec.map((stage, index) => (
                <div key={index} className={styles.stageColumn}>
                  {/* 步骤指示器 */}
                  <div className={styles.stageIndicator}>
                    <div className={styles.stageIndicatorNumber}>
                      {index + 1}
                    </div>
                    <div className={styles.stageIndicatorName}>
                      {stage.name}
                    </div>

                    {index < data.spec!.length - 1 && (
                      <div className={styles.stageIndicatorLine} />
                    )}
                  </div>

                  {/* 活动卡片列表 */}
                  <div className={styles.stageActivities}>
                    {stage.serviceFlowActivities?.map((activity, actIndex) => (
                      <ActivityCard
                        key={actIndex}
                        title={activity.name}
                        description={activity.description}
                        assignee={activity.aiEmployeeId}
                        onClick={() =>
                          handleActivityClick(activity, stage.name)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* 活动详情模态框 */}
      <ActivityDetailModal
        activity={selectedActivity}
        visible={!!selectedActivity}
        onClose={handleCloseActivityDetail}
        onChange={(activity) =>
          modifyActivity?.(currentStage.current!, activity)
        }
      />
    </>
  );
}
