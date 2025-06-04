import React, { useMemo } from "react";
import type { EoDisplayCanvasProps } from "@next-bricks/diagram/display-canvas";
import sharedStyles from "../shared.module.css";
import { AsyncWrappedDisplayCanvas } from "../diagram";

const DEFAULT_NODE_SIZE: [number, number] = [100, 100];

export function Topology(): JSX.Element {
  const cells = useMemo<EoDisplayCanvasProps["cells"]>(() => {
    return [
      {
        type: "edge",
        source: "nginx",
        target: "cmdb_service",
      },
      {
        type: "edge",
        source: "cmdb_service",
        target: "easy_core",
      },
      {
        type: "node",
        id: "nginx",
        data: {
          name: "nginx",
          icon: {
            lib: "easyops",
            category: "model",
            icon: "nginx",
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

  // const layoutOptions = useMemo<EoDisplayCanvasProps["layoutOptions"]>(() => {
  //   return {
  //     nodePadding: 0,
  //   };
  // }, []);

  const defaultNodeBricks = useMemo<
    EoDisplayCanvasProps["defaultNodeBricks"]
  >(() => {
    return [
      {
        useBrick: {
          brick: "div",
          properties: {
            style: {
              padding: "5px",
            },
          },
          children: [
            {
              brick: "eo-icon",
              properties: {
                lib: "<% DATA.node.data.icon.lib %>",
                category: "<% DATA.node.data.icon.category %>",
                icon: "<% DATA.node.data.icon.icon %>",
                style: {
                  fontSize: "32px",
                },
              },
            },
          ],
        },
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

  return (
    <div
      className={`${sharedStyles["table-container"]} ${sharedStyles["topology-container"]}`}
    >
      <AsyncWrappedDisplayCanvas
        cells={cells}
        layout="force"
        // layoutOptions={layoutOptions}
        defaultNodeSize={DEFAULT_NODE_SIZE}
        defaultNodeBricks={defaultNodeBricks}
        defaultEdgeLines={defaultEdgeLines}
        hideZoomBar
      />
    </div>
  );
}
