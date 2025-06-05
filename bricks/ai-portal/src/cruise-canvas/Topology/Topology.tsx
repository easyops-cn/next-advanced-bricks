import React, { useCallback, useMemo, useRef } from "react";
import type {
  EoDisplayCanvasProps,
  EoDisplayCanvas,
} from "@next-bricks/diagram/display-canvas";
import sharedStyles from "../shared.module.css";
import toolbarStyles from "../toolbar.module.css";
import styles from "./Topology.module.css";
import { AsyncWrappedDisplayCanvas } from "../diagram";
import { WrappedIcon } from "../bricks";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";

const DEFAULT_NODE_SIZE: [number, number] = [100, 100];

export function Topology(): JSX.Element {
  const cells = useMemo<EoDisplayCanvasProps["cells"]>(() => {
    return [
      {
        type: "edge",
        source: "user_service",
        target: "cmdb_service",
        // view: {
        //   type: "curve"
        // }
      },
      {
        type: "edge",
        source: "cmdb_service",
        target: "easy_core",
        view: {
          // strokeColor: "var(--color-warning)",
          text: {
            content: "Blocked",
            // placement: "end",
            offset: 12,
            style: {
              color: "var(--color-error)",
            },
          },
        },
      },
      {
        type: "edge",
        source: "cmdb_service",
        target: "ens_client",
        // view: {
        //   type: "curve"
        // }
      },
      {
        type: "edge",
        source: "user_service",
        target: "ens_client",
        // view: {
        //   type: "curve"
        // }
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
    ];
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
      padding: [12, 12, 34],
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
        autoSize={autoSize}
        defaultNodeSize={DEFAULT_NODE_SIZE}
        defaultNodeBricks={defaultNodeBricks}
        defaultEdgeLines={defaultEdgeLines}
        hideZoomBar
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
      style={{
        padding: 5,
        fontSize: 24,
        color: node.id === "easy_core" ? "var(--color-warning)" : undefined,
      }}
      ref={refCallback}
    >
      <WrappedIcon {...node.data.icon} style={{ display: "block" }} />
      <div
        style={{
          position: "absolute",
          bottom: -20,
          left: "50%",
          transform: "translate(-50%, 0)",
          fontSize: 14,
          background: "#fff",
          padding: "0 2px 2px",
          maxWidth: "124px",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {node.data.name}
      </div>
    </div>
  );
}
