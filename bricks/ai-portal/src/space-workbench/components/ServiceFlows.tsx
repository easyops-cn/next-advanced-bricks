import React, { useState } from "react";
import { wrapBrick } from "@next-core/react-element";
import { EmptyState } from "./EmptyState.js";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type {
  Modal,
  ModalProps,
  ModalEvents,
  ModalMapEvents,
} from "@next-bricks/containers/modal";
import { BusinessFlowPreview } from "./BusinessFlowPreview.js";
import styles from "./ServiceFlows.module.css";
import { K, t } from "../i18n.js";
import { BusinessFlow } from "../interfaces.js";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

const WrappedModal = wrapBrick<
  Modal,
  ModalProps & { noFooter?: boolean },
  ModalEvents,
  ModalMapEvents
>("eo-modal", {
  onClose: "close",
  onConfirm: "confirm",
  onCancel: "cancel",
  onOpen: "open",
});

export interface ServiceFlowsProps {
  businessFlows?: BusinessFlow[];
  onFlowClick?: (flow: BusinessFlow) => void;
}

export function ServiceFlows(props: ServiceFlowsProps) {
  const { businessFlows = [], onFlowClick } = props;

  const [selectedFlow, setSelectedFlow] = useState<BusinessFlow | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleFlowClick = (flow: BusinessFlow) => {
    onFlowClick?.(flow);
  };

  const handleDetailClick = (flow: BusinessFlow, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFlow(flow);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedFlow(null);
  };

  return (
    <div className={styles.serviceFlows}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h3 className={styles.title}>{t(K.FLOW_SIDEBAR_TITLE)}</h3>
          <p className={styles.subtitle}>{t(K.FLOW_SIDEBAR_SUBTITLE)}</p>
        </div>
      </div>

      {!businessFlows?.length ? (
        <EmptyState title={t(K.NO_SERVICE_FLOWS)} />
      ) : (
        <div className={styles.flowList}>
          {businessFlows.map((flow) => (
            <div
              key={flow.instanceId}
              className={styles.flowCard}
              onClick={() => handleFlowClick(flow)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.flowName}>{flow.name}</span>
                <button
                  className={styles.detailButton}
                  onClick={(e) => handleDetailClick(flow, e)}
                  title={t(K.NO_DESCRIPTION)}
                >
                  <WrappedIcon lib="antd" icon="eye" theme="outlined" />
                </button>
              </div>
              <p className={styles.flowDescription} title={flow.description}>
                {flow.description}
              </p>
              {/* 阶段进度条 - 根据业务流的 spec 展示 */}
              {flow.spec && flow.spec.length > 0 && (
                <div className={styles.stageProgress}>
                  {flow.spec.map((stage, index) => (
                    <div
                      key={index}
                      className={styles.progressBar}
                      title={stage.name}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 业务流详情模态框 */}
      <WrappedModal
        modalTitle={selectedFlow?.name}
        width={700}
        visible={isModalVisible}
        onCancel={handleCloseModal}
        onClose={handleCloseModal}
        noFooter
        maskClosable
      >
        <BusinessFlowPreview
          activityOnlyRead
          data={selectedFlow ?? undefined}
          viewType="visual"
        />
      </WrappedModal>
    </div>
  );
}
