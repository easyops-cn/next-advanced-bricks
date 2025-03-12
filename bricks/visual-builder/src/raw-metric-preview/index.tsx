import React, { useCallback, useEffect, useRef, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import type { BrickConf, ContextConf, MicroApp } from "@next-core/types";
import classNames from "classnames";
import { getBasePath } from "@next-core/runtime";
import type { PreviewWindow } from "@next-core/preview/types";
import { JSON_SCHEMA, safeDump } from "js-yaml";
import { __compat_internals } from "../shared/compat_internals";
import type { MetricVisualConfig } from "./raw-metric-interfaces";
// import { convertToStoryboard } from "./convert";
import styleText from "./styles.shadow.css";
import sharedPreviewStyleText from "../raw-data-preview/preview.shadow.css";
import previewStyleText from "./preview.shadow.css";
import { convertToChart } from "./convert";
import {
  generateMetricCandidates,
  type Metric,
} from "./generateMetricCandidates";

const { defineElement, property } = createDecorators();

export interface RawMetricPreviewProps {
  previewUrl?: string;
  generations?: MetricGeneration[];
  grouped?: boolean;
  // mocks?: Record<string, unknown>;
  busy?: boolean;
  theme?: string;
  uiVersion?: string;
  app?: MicroApp;
}

export interface MetricGeneration {
  generationId?: string;
  objectId: string;
  objectName: string;
  propertyId: string;
  propertyName?: string;
  propertyUnit: string;
  propertyDataType: "long" | "double";
  propertyInstanceId?: string;
  comment?: string;
  approved?: boolean;
  candidates: MetricVisualConfig[] | null;
  mockData: unknown[];
  groupIndex?: number;
  group?: string;
  counter?: string;
}

export interface CommentDetail {
  comment: string;
  propertyInstanceId?: string;
}

export interface ApproveDetail {
  approved: boolean;
  propertyInstanceId?: string;
}

interface BasePreviewMessage {
  channel: "raw-metric-preview";
}

interface CommentMessage extends BasePreviewMessage {
  type: "comment";
  payload: CommentDetail;
}

interface ApproveMessage extends BasePreviewMessage {
  type: "approve";
  payload: ApproveDetail;
}

interface ResizeMessage extends BasePreviewMessage {
  type: "resize";
  payload: {
    width: number;
    height: number;
  };
}

type PreviewMessage = CommentMessage | ApproveMessage | ResizeMessage;

/**
 * 构件 `visual-builder.raw-metric-preview`
 *
 * @internal
 */
export
@defineElement("visual-builder.raw-metric-preview", {
  styleTexts: [styleText],
})
class RawMetricPreview extends ReactNextElement {
  @property()
  accessor previewUrl: string | undefined;

  @property({ attribute: false })
  accessor generations: MetricGeneration[] | undefined;

  @property({ type: Boolean })
  accessor grouped: boolean | undefined;

  // @property({ attribute: false })
  // accessor mocks: Record<string, unknown> | undefined;

  @property({ type: Boolean })
  accessor busy: boolean | undefined;

  @property()
  accessor theme: string | undefined;

  @property()
  accessor uiVersion: string | undefined;

  @property()
  accessor app: MicroApp | undefined;

  render() {
    return (
      <RawMetricPreviewComponent
        root={this}
        previewUrl={this.previewUrl}
        generations={this.generations}
        grouped={this.grouped}
        // mocks={this.mocks}
        busy={this.busy}
        theme={this.theme}
        uiVersion={this.uiVersion}
        app={this.app}
      />
    );
  }
}

export interface RawMetricPreviewComponentProps extends RawMetricPreviewProps {
  root: HTMLElement;
}

export function RawMetricPreviewComponent({
  root,
  previewUrl,
  generations,
  grouped,
  // mocks,
  busy,
  theme,
  uiVersion,
  app,
}: RawMetricPreviewComponentProps) {
  const iframeRef = useRef<HTMLIFrameElement>();
  const [ready, setReady] = useState(false);
  const [injected, setInjected] = useState(false);

  const handleIframeLoad = useCallback(() => {
    const check = () => {
      const iframeWin = iframeRef.current?.contentWindow as PreviewWindow;
      if (iframeWin?._preview_only_render) {
        setReady(true);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }, []);

  useEffect(() => {
    if (ready) {
      const iframeWin = iframeRef.current!.contentWindow as PreviewWindow;
      iframeWin.postMessage(
        {
          channel: "raw-metric-preview",
          type: "busy",
          payload: busy,
        },
        location.origin
      );
    }
  }, [busy, ready]);

  useEffect(() => {
    if (ready) {
      const iframeWin = iframeRef.current!.contentWindow as PreviewWindow;
      const onMessage = ({ data }: MessageEvent<PreviewMessage>) => {
        if (data?.channel === "raw-metric-preview") {
          switch (data.type) {
            case "resize":
              root.style.height = `${data.payload.height + 2}px`;
              break;
          }
        }
      };
      iframeWin.addEventListener("message", onMessage);
      return () => {
        iframeWin.removeEventListener("message", onMessage);
      };
    }
  }, [ready, root]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    const pkg = __compat_internals.getBrickPackagesById(
      "bricks/visual-builder"
    );
    if (!pkg) {
      throw new Error(
        "Cannot find preview agent package: bricks/visual-builder"
      );
    }
    const inject = (iframeRef.current!.contentWindow as PreviewWindow)!
      ._preview_only_inject;

    const fixedPkg = {
      ...pkg,
      filePath: previewUrl
        ? new URL(pkg.filePath, new URL(previewUrl, location.origin)).toString()
        : `${location.origin}${getBasePath()}${
            window.PUBLIC_ROOT ?? ""
          }${pkg.filePath}`,
    };

    Promise.allSettled(
      [
        "visual-builder.pre-generated-table-view",
        "visual-builder.pre-generated-container",
      ].map((brick) => inject(brick, fixedPkg, undefined, true))
    ).then(() => {
      setInjected(true);
    });
  }, [previewUrl, ready]);

  useEffect(() => {
    if (!injected) {
      return;
    }
    const render = (iframeRef.current?.contentWindow as PreviewWindow)
      ?._preview_only_render;
    if (!render) {
      return;
    }

    const tableChildren: BrickConf[] = [
      ...(grouped
        ? [
            {
              brick: "div",
              properties: {
                textContent: "分组",
                className: "head-cell",
              },
            },
          ]
        : []),
      {
        brick: "div",
        properties: {
          textContent: "指标",
          className: "head-cell",
        },
      },
      {
        brick: "div",
        properties: {
          textContent: "别名",
          className: "head-cell",
        },
      },
      {
        brick: "div",
        properties: {
          textContent: "",
          className: "head-cell",
        },
      },
      {
        brick: "div",
        properties: {
          textContent: "视觉重量 (由低至高)",
          className: "head-cell",
          style: {
            gridColumn: "span 4",
            textAlign: "center",
          },
        },
      },
    ];
    const table: BrickConf & { context?: ContextConf[] } = {
      brick: "visual-builder.pre-generated-table-view",
      context: [
        {
          name: "busy",
        },
      ],
      properties: {
        style: {
          gridTemplateColumns: `${grouped ? "minmax(129px, 0.5fr) " : ""}minmax(120px, 0.8fr) minmax(120px, 0.5fr) 32px repeat(2, 0.6fr) repeat(2, 1fr)`,
        },
      },
      children: tableChildren,
    };

    const handledGroupIndexes = new Set<number>();

    const groupMap = new Map<number, MetricGeneration[]>();
    for (const generation of generations) {
      const index = generation.groupIndex;
      if (index != null) {
        const metrics = groupMap.get(index) ?? [];
        groupMap.set(index, metrics.concat(generation));
      }
    }

    for (let i = 0, size = generations.length; i < size; i++) {
      const generation = generations[i];
      const isLastRow = i === size - 1;
      let isLastGroupedRow = false;

      // const candidatesByVisualWeight = new Map<number, VisualConfig>();
      // for (const candidate of generation.candidates ?? []) {
      //   candidatesByVisualWeight.set(candidate.visualWeight ?? 0, candidate);
      // }

      let groupedMetrics: MetricGeneration[] | undefined;
      let isMergedRow = false;
      if (grouped) {
        const { groupIndex } = generation;
        if (groupIndex == null) {
          tableChildren.push({
            brick: "div",
            properties: {
              textContent: "",
              className: classNames("body-cell", {
                "last-row-cell": isLastRow,
              }),
            },
          });
        } else if (!handledGroupIndexes.has(groupIndex)) {
          handledGroupIndexes.add(groupIndex);
          groupedMetrics = groupMap.get(groupIndex)!;
          const groupCount = groupedMetrics.length;
          isLastGroupedRow = i + groupCount - 1 === size - 1;
          tableChildren.push({
            brick: "div",
            properties: {
              textContent: generation.group,
              className: classNames("body-cell", {
                "last-row-cell": isLastGroupedRow,
              }),
              style: {
                gridRow: `span ${groupCount}`,
              },
            },
          });
        } else {
          isMergedRow = true;
        }
      }

      tableChildren.push(
        {
          brick: "div",
          properties: {
            className: classNames("body-cell", {
              "last-row-cell": isLastRow,
            }),
          },
          children: [
            {
              brick: "span",
              properties: {
                textContent: `${generation.propertyId}`,
              },
            },
          ],
        },
        {
          brick: "div",
          properties: {
            className: classNames("body-cell", {
              "last-row-cell": isLastRow,
            }),
          },
          children: [
            {
              brick: "span",
              properties: {
                textContent: `${generation.propertyName || ""}`,
              },
            },
          ],
        },
        {
          // 绿色圆点表示已生成
          brick: "div",
          properties: {
            className: classNames("body-cell", {
              "last-row-cell": isLastRow,
            }),
          },
          children:
            generation.candidates?.length || generation.mockData
              ? [
                  {
                    brick: "eo-icon",
                    properties: {
                      lib: "fa",
                      prefix: generation.candidates?.length ? "fas" : "far",
                      icon: "circle",
                      style: {
                        color:
                          generation.generationId &&
                          generation.candidates?.length
                            ? "var(--palette-green-6)"
                            : "var(--palette-gray-6)",
                        transformOrigin: "center center",
                        transform: "scale(0.5)",
                      },
                    },
                  },
                ]
              : undefined,
        }
      );

      const metricKey = generation.propertyName || generation.propertyId;

      const rawMetricData: Metric = {
        name: generation.propertyId,
        displayName: generation.propertyName,
        unit: generation.propertyUnit,
        dataType: generation.propertyDataType,
      };
      const candidates = generateMetricCandidates(rawMetricData);

      // 生成的编排
      for (let i = -1; i < 3; i++) {
        const candidate = candidates.find((item) => item.visualWeight === i);

        // let brick: BrickConf;
        // if (candidate) {
        //   brick = convertToStoryboard(candidate, generation.propertyId);
        // }

        const isPercentBase1 = generation.propertyUnit === "percent(1)";
        const isPercentBase100 =
          generation.propertyUnit === "percent(100)" ||
          generation.propertyUnit === "%";

        let brick: BrickConf | undefined;
        const size = i <= 0 ? "small" : i === 1 ? "medium" : "large";
        const isMergedCell = size !== "small" && isMergedRow;
        const counterMetric = generation.counter
          ? groupedMetrics?.find((gen) => gen.propertyId === generation.counter)
          : undefined;
        const counterMetricKey =
          counterMetric?.propertyName || counterMetric?.propertyId;
        if (isMergedCell) {
          continue;
        }

        const isGroupedCell = size !== "small" && groupedMetrics;
        if (
          generation.mockData &&
          (isPercentBase1 || isPercentBase100 || i >= 0)
        ) {
          // const chartType = i === -1 ? "gauge" : i === 2 ? "area" : "line";

          brick = convertToChart(
            {
              ...candidate,
              // visualWeight: i,
              // color: "orange",
              // chartType,
              // size,
              min: counterMetricKey ? undefined : candidate.min,
              // precision:
              //   isPercentBase1 || isPercentBase100
              //     ? 1
              //     : generation.propertyDataType === "double"
              //       ? 2
              //       : 0,
            },
            "<% DATA %>",
            metricKey,
            {
              unit: generation.propertyUnit,
            },
            groupedMetrics?.map((gen) => gen.propertyName || gen.propertyId),
            counterMetricKey
          );
        }

        tableChildren.push({
          brick: "div",
          properties: {
            className: classNames("body-cell", {
              "last-row-cell": isLastRow || isLastGroupedRow,
              "large-chart-cell": size !== "small",
            }),
            style: {
              justifyContent: "center",
              ...(isGroupedCell
                ? { gridRow: `span ${groupedMetrics.length}` }
                : null),
            },
          },
          children: [
            {
              brick: "div",
              properties: {
                className: "list",
              },
              children: brick
                ? [
                    {
                      brick: "visual-builder.pre-generated-container",
                      properties: {
                        useBrick: [brick],
                        dataSource: generation.mockData.map((value, index) => ({
                          time:
                            Math.round(+new Date() / 1000) -
                            86400 +
                            index * 300,
                          ...(isGroupedCell
                            ? Object.fromEntries(
                                groupedMetrics.map((gen) => [
                                  gen.propertyName || gen.propertyId,
                                  gen.mockData?.[index],
                                ])
                              )
                            : { [metricKey]: value }),
                        })),
                      },
                      errorBoundary: true,
                    },
                  ]
                : undefined,
            },
          ],
        });
      }
    }

    render(
      "yaml",
      {
        yaml: safeDump(
          [
            {
              brick: "sl-resize-observer",
              children: [table],
              events: {
                "sl-resize": {
                  action: "window.postMessage",
                  args: [
                    {
                      channel: "raw-metric-preview",
                      type: "resize",
                      payload: `<%
                        EVENT.detail.entries[0].borderBoxSize
                          ? { width: EVENT.detail.entries[0].borderBoxSize[0].inlineSize, height: EVENT.detail.entries[0].borderBoxSize[0].blockSize }
                          : { width: EVENT.detail.entries[0].contentRect.width, height: EVENT.detail.entries[0].contentRect.height }
                      %>`,
                    },
                  ],
                },
              },
            },
            {
              brick: "eo-message-listener",
              properties: {
                sameOrigin: true,
              },
              events: {
                message: {
                  if: "<% EVENT.detail.data?.channel === 'raw-metric-preview' && EVENT.detail.data.type === 'busy' %>",
                  action: "context.replace",
                  args: ["busy", "<% EVENT.detail.data.payload %>"],
                },
              },
              portal: true,
              errorBoundary: true,
            },
          ],
          {
            schema: JSON_SCHEMA,
            skipInvalid: true,
            noRefs: true,
            noCompatMode: true,
          }
        ),
      },
      {
        app,
        theme,
        uiVersion,
        styleText: [sharedPreviewStyleText, previewStyleText].join("\n"),
      }
    );
  }, [app, injected, generations, theme, uiVersion, grouped]);

  return (
    <div className={classNames("container")}>
      <iframe
        ref={iframeRef}
        src={previewUrl ?? `${getBasePath()}_brick-preview-v3_/preview/`}
        loading="lazy"
        onLoad={handleIframeLoad}
      />
    </div>
  );
}
