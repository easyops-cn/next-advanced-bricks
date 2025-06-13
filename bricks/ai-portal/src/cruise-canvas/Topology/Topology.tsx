import React, { useCallback, useMemo, useRef } from "react";
import type {
  EoDisplayCanvasProps,
  EoDisplayCanvas,
} from "@next-bricks/diagram/display-canvas";
import classNames from "classnames";
import sharedStyles from "../shared.module.css";
import toolbarStyles from "../toolbar.module.css";
import styles from "./Topology.module.css";
import nodeStyleText from "./node.shadow.css";
import { AsyncWrappedDisplayCanvas } from "../diagram";
import { WrappedIcon } from "../bricks";
import type { ComponentGraph, RawComponentGraphNode } from "../interfaces";

const DEFAULT_NODE_SIZE: EoDisplayCanvasProps["defaultNodeSize"] = [34, 34];
const CANVAS_PADDING: Required<EoDisplayCanvasProps>["layoutOptions"]["padding"] =
  [12, 54, 34];
const extraStyleTexts = [nodeStyleText];

export interface TopologyProps {
  componentGraph: ComponentGraph;
  filter?: "all" | "related" | "minimal";
  autoSize?: boolean;
}

export function Topology({
  componentGraph,
  filter,
  autoSize: _autoSize,
}: TopologyProps): JSX.Element {
  const cells = useMemo<EoDisplayCanvasProps["cells"]>(() => {
    if (filter !== "all") {
      const nodesWithStatus = componentGraph.nodes.filter(
        (node) => !!node.data.status
      );
      const nodeIdsWithStatus = new Set(nodesWithStatus.map((node) => node.id));
      const relatedEdges = componentGraph.edges.filter(
        (edge) =>
          nodeIdsWithStatus.has(edge.source) &&
          (filter === "related" || nodeIdsWithStatus.has(edge.target))
      );
      const relatedNodeIds =
        filter === "minimal"
          ? nodeIdsWithStatus
          : new Set([
              ...nodeIdsWithStatus,
              ...new Set(relatedEdges.map((edge) => edge.target)),
            ]);
      return [
        ...relatedEdges,
        ...componentGraph.nodes.filter((node) => relatedNodeIds.has(node.id)),
      ];
    }

    return [...componentGraph.edges, ...componentGraph.nodes];
    /* return [
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
    ] as EoDisplayCanvasProps["cells"]; */
  }, [componentGraph, filter]);

  const layoutOptions = useMemo<EoDisplayCanvasProps["layoutOptions"]>(() => {
    return {
      padding: CANVAS_PADDING,
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
    () =>
      _autoSize
        ? {
            width: "fit-content",
            height: "fit-content",
            // 453 - 18 - 8 - 18 = 409
            minWidth: 409,
            // Todo: listen on resize
            maxWidth: window.innerWidth * 0.9,
            minHeight: 150,
          }
        : undefined,
    [_autoSize]
  );

  const ref = useRef<EoDisplayCanvas>(null);

  const onReCenter = useCallback(() => {
    ref.current?.center();
  }, []);

  return (
    <div
      className={classNames(sharedStyles["table-container"], styles.topology, {
        [styles["auto-size"]]: _autoSize,
      })}
    >
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
        scrollable={false}
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
    data: RawComponentGraphNode;
  };
  refCallback?: (element: HTMLElement | null) => void;
}

function TopologyNode({ node, refCallback }: TopologyNodeProps): JSX.Element {
  return (
    <div
      className={classNames("topology-node", {
        "topology-node-trouble": node.data.status === "trouble",
        "topology-node-ok": node.data.status === "ok",
      })}
      ref={refCallback}
    >
      <WrappedIcon lib="fa" prefix="fas" icon="cube" />
      <div className="topology-node-label">{node.data.name}</div>
    </div>
  );
}
