import React, { useCallback, useMemo, useRef } from "react";
import type {
  EoDisplayCanvasProps,
  EoDisplayCanvas,
} from "@next-bricks/diagram/display-canvas";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import sharedStyles from "../shared.module.css";
import toolbarStyles from "../toolbar.module.css";
import styles from "./Topology.module.css";
import nodeStyleText from "./node.shadow.css";
import { AsyncWrappedDisplayCanvas } from "../diagram";
import { WrappedIcon } from "../bricks";

const DEFAULT_NODE_SIZE: EoDisplayCanvasProps["defaultNodeSize"] = [100, 100];
const CANVAS_PADDING: EoDisplayCanvasProps["padding"] = [12, 54, 34];
const extraStyleTexts = [nodeStyleText];

export function Topology(): JSX.Element {
  const cells = useMemo<EoDisplayCanvasProps["cells"]>(() => {
    return [
      {
        type: "edge",
        source: "permission_service",
        target: "cmdb_service",
      },
      {
        type: "edge",
        source: "sys_service",
        target: "cmdb_service",
      },
      {
        type: "edge",
        source: "cmdb_extend",
        target: "cmdb_service",
      },
      {
        type: "edge",
        source: "user_service",
        target: "cmdb_service",
      },
      {
        type: "edge",
        source: "cmdb_service",
        target: "easy_core",
        view: {
          strokeColor: "var(--color-error)",
          text: {
            content: "×",
            offset: 7,
            style: {
              color: "var(--color-error)",
              lineHeight: "14px",
            },
          },
        },
      },
      {
        type: "edge",
        source: "cmdb_service",
        target: "ens_client",
      },
      {
        type: "edge",
        source: "user_service",
        target: "ens_client",
      },
      {
        type: "node",
        id: "permission_service",
        data: {
          name: "permission_service",
          icon: {
            lib: "easyops",
            category: "app",
            icon: "permission-center-app",
          },
        },
      },
      {
        type: "node",
        id: "sys_service",
        data: {
          name: "sys_service",
          icon: {
            lib: "easyops",
            category: "customer",
            icon: "system-setting",
          },
        },
      },
      {
        type: "node",
        id: "cmdb_extend",
        data: {
          name: "cmdb_extend",
          icon: {
            lib: "easyops",
            category: "itsc-form",
            icon: "extends",
          },
        },
      },
      {
        type: "node",
        id: "user_service",
        data: {
          name: "user_service",
          icon: {
            lib: "easyops",
            category: "model",
            icon: "user-group",
          },
        },
      },
      {
        type: "node",
        id: "easy_core",
        data: {
          name: "easy_core",
          icon: {
            lib: "easyops",
            category: "model",
            icon: "sql-package",
          },
        },
      },
      {
        type: "node",
        id: "ens_client",
        data: {
          name: "ens_client",
          icon: {
            lib: "fa",
            prefix: "fas",
            icon: "map-location",
          },
        },
      },
      {
        type: "node",
        id: "cmdb_service",
        data: {
          name: "cmdb_service",
          icon: {
            lib: "easyops",
            category: "product",
            icon: "easy-cmdb",
          },
        },
      },
    ] as EoDisplayCanvasProps["cells"];
  }, []);

  const layoutOptions = useMemo<EoDisplayCanvasProps["layoutOptions"]>(() => {
    return {
      nodesep: 90,
      ranksep: 70,
    };
  }, []);

  const defaultNodeBricks = useMemo<
    EoDisplayCanvasProps["defaultNodeBricks"]
  >(() => {
    return [
      {
        component: TopologyNode,
      },
    ];
  }, []);

  const defaultEdgeLines = useMemo<
    EoDisplayCanvasProps["defaultEdgeLines"]
  >(() => {
    return [
      {
        strokeColor: "#8c8c8c",
      },
    ];
  }, []);

  const autoSize = useMemo<EoDisplayCanvasProps["autoSize"]>(
    () => ({
      width: "fit-content",
      height: "fit-content",
      // 453 - 18 - 8 - 18 = 409
      minWidth: 409,
      // Todo: listen on resize
      maxWidth: window.innerWidth * 0.9,
      minHeight: 150,
    }),
    []
  );

  const ref = useRef<EoDisplayCanvas>(null);

  const onReCenter = useCallback(() => {
    ref.current?.center();
  }, []);

  return (
    <div className={`${sharedStyles["table-container"]} ${styles.topology}`}>
      <AsyncWrappedDisplayCanvas
        ref={ref}
        cells={cells}
        layout="dagre"
        layoutOptions={layoutOptions}
        padding={CANVAS_PADDING}
        autoSize={autoSize}
        defaultNodeSize={DEFAULT_NODE_SIZE}
        defaultNodeBricks={defaultNodeBricks}
        defaultEdgeLines={defaultEdgeLines}
        hideZoomBar
        extraStyleTexts={extraStyleTexts}
      />
      <div className={`${toolbarStyles.toolbar} ${styles.toolbar}`}>
        <button onClick={onReCenter}>
          <WrappedIcon lib="fa" prefix="fas" icon="expand" />
        </button>
      </div>
    </div>
  );
}

interface TopologyNodeProps {
  node: {
    id: string;
    data: {
      name: string;
      icon: GeneralIconProps;
    };
  };
  refCallback?: (element: HTMLElement | null) => void;
}

function TopologyNode({ node, refCallback }: TopologyNodeProps): JSX.Element {
  return (
    <div
      className="topology-node"
      style={{
        color: node.id === "easy_core" ? "var(--color-warning)" : undefined,
      }}
      ref={refCallback}
    >
      <WrappedIcon {...node.data.icon} style={{ display: "block" }} />
      <div className="topology-node-label">{node.data.name}</div>
    </div>
  );
}
