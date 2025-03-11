import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { __secret_internals, getBasePath } from "@next-core/runtime";
import type { PreviewWindow } from "@next-core/preview/types";
import { safeDump } from "js-yaml";
import type { BrickConf } from "@next-core/types";
import { pick, uniqueId } from "lodash";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { /* K, */ NS, locales /* , t */ } from "./i18n.js";
import type { VisualConfig } from "../raw-data-preview/raw-data-interfaces.js";
import { convertToStoryboard } from "../raw-data-preview/convert.js";
import type { MetricVisualConfig } from "../raw-metric-preview/raw-metric-interfaces.js";
import { convertToChart } from "../raw-metric-preview/convert.js";
import { convertToBrickConf } from "./convertToBrickConf.js";
import updateWeightMap from "./updateWeightMap.js?raw";
import type { MetricGroup } from "../data-providers/get-config-by-data-for-ai.js";
import styleText from "./styles.shadow.css";
import previewStyleText from "./preview.shadow.css";

initializeI18n(NS, locales);

const { defineElement, property, event } = createDecorators();

export interface PreGeneratedConfigProps {
  previewUrl?: string;
  attrList?: Attr[];
  mockList?: Record<string, unknown>[];
  metricGroups?: MetricGroup[];
  containerConfig?: ContainerConfig;
}

export type Attr = ObjectAttr | MetricAttr;

export interface ObjectAttr {
  id: string;
  name: string;
  enum?: unknown[];
  metricKey?: undefined;
  candidates?: VisualConfig[];
}

export interface MetricAttr {
  metricKey: string;
  id: string;
  name?: string;
  candidates?: MetricVisualConfig[];
  unit?: string;
}

interface GroupedMetric {
  id: number;
  group: string;
  metrics: MetricAttr[];
  counter?: string;
}

interface BaseConfigMessage {
  channel: "pre-generated-config";
  id?: string; // The unique id for message callbacks
}

interface ConfigChangeMessage extends BaseConfigMessage {
  type: "config-change";
  payload: PreConfig;
}

interface GroupChangeMessage extends BaseConfigMessage {
  type: "group-change";
  payload: {
    id: number;
    metrics: string[];
  };
}

interface OrderChangeMessage extends BaseConfigMessage {
  type: "order-change";
  payload: {
    orderedIds: (string | number)[];
  };
}

interface SelectionChangeMessage extends BaseConfigMessage {
  type: "selection-change";
  payload: {
    selectedIds: (string | number)[];
  };
}

interface GetConfigResponseMessage extends BaseConfigMessage {
  type: "get-config-response";
  payload: PreConfig;
}

type ConfigMessage =
  | ConfigChangeMessage
  | GroupChangeMessage
  | OrderChangeMessage
  | SelectionChangeMessage
  | GetConfigResponseMessage;

export interface PreConfig {
  selectedIds: (string | number)[];
  orderedIds: (string | number)[];
  weightMapLiteral: [string | number, number][];
  groupMapLiteral: [number, string[]][];
}

export type Config = DefaultConfig | ChartConfig | GroupedChartConfig;

export interface DefaultConfig {
  meta: DefaultConfigMeta;
  candidate: VisualConfig;
}

export interface ChartConfig {
  meta: ChartConfigMeta;
  candidate: MetricVisualConfig;
}

export interface GroupedChartConfig {
  meta: GroupedChartConfigMeta;
  candidate: MetricVisualConfig;
}

export interface ContainerConfig {
  type: "table" | "descriptions" | "cards" | "chart" | null | undefined;
  dataName: string;
  dataType?: "context" | "state";
  settings?: {
    pagination?: boolean;
    fields?: Record<string, string>;
  };
}

/**
 * 构件 `visual-builder.pre-generated-config`
 */
export
@defineElement("visual-builder.pre-generated-config", {
  styleTexts: [styleText],
})
class PreGeneratedConfig
  extends ReactNextElement
  implements PreGeneratedConfigProps
{
  @property()
  accessor previewUrl: string | undefined;

  @property({ attribute: false })
  accessor attrList: ObjectAttr[] | undefined;

  @property({ attribute: false })
  accessor mockList: Record<string, unknown>[] | undefined;

  @property({ attribute: false })
  accessor metricGroups: MetricGroup[] | undefined;

  @property({ attribute: false })
  accessor containerConfig: ContainerConfig | undefined;

  @event({ type: "brick.change" })
  accessor #brickChangeEvent: EventEmitter<BrickConf | null>;

  #handleBrickChange = (payload: BrickConf | null) => {
    this.#brickChangeEvent.emit(payload);
  };

  render() {
    return (
      <PreGeneratedConfigComponent
        previewUrl={this.previewUrl}
        attrList={this.attrList}
        mockList={this.mockList}
        metricGroups={this.metricGroups}
        containerConfig={this.containerConfig}
        onBrickChange={this.#handleBrickChange}
        root={this}
      />
    );
  }
}

export interface PreGeneratedConfigComponentProps
  extends PreGeneratedConfigProps {
  root: HTMLElement;
  onBrickChange: (payload: BrickConf | null) => void;
}

export function PreGeneratedConfigComponent({
  previewUrl,
  attrList,
  mockList,
  metricGroups,
  containerConfig,
  root,
  onBrickChange,
}: PreGeneratedConfigComponentProps) {
  const iframeRef = useRef<HTMLIFrameElement>();
  const [ready, setReady] = useState(false);
  const [injected, setInjected] = useState(false);
  const [config, setConfig] = useState<PreConfig | null>(null);
  const [groupMap, setGroupMap] = useState<Map<number, string[] | null>>(null);
  // Use ref instead of state to avoid re-rendering
  const selectedIdsRef = useRef<(string | number)[] | null>(null);
  const orderedIdsRef = useRef<(string | number)[] | null>(null);
  const eventAgentId = useMemo(() => uniqueId("event-agent-"), []);

  const viewType =
    containerConfig?.type === "chart"
      ? metricGroups?.length
        ? "grouped-chart"
        : "chart"
      : "default";

  const viewAttrList = useMemo(() => {
    return viewType === "default"
      ? attrList
      : attrList?.filter((attr) => attr.metricKey);
  }, [attrList, viewType]);

  const dataSourceList = useMemo(() => {
    return viewType === "grouped-chart"
      ? buildGroupedMetrics(viewAttrList as MetricAttr[], metricGroups)
      : viewAttrList;
  }, [metricGroups, viewAttrList, viewType]);

  useEffect(() => {
    setGroupMap(null);
    selectedIdsRef.current = null;
    orderedIdsRef.current = null;
  }, [dataSourceList]);

  useEffect(() => {
    if (config) {
      const orderedList = config.selectedIds
        .sort(
          (a, b) => config.orderedIds.indexOf(a) - config.orderedIds.indexOf(b)
        )
        .map((id) => dataSourceList.find((item) => item.id === id))
        .filter(Boolean);
      const weightMap = new Map(config.weightMapLiteral);
      const groupMap = new Map(config.groupMapLiteral);

      const configList = orderedList.map((item) => {
        const meta = getConfigMeta(
          viewType,
          viewAttrList,
          metricGroups,
          item,
          groupMap
        );
        const candidates =
          meta.viewType === "grouped-chart"
            ? meta.metric.candidates?.filter((can) => can.size !== "small")
            : (item as ObjectAttr | MetricAttr).candidates;
        const candidate = candidates?.find(
          (can) => can.visualWeight === weightMap.get(item.id)
        );
        return { candidate, meta } as Config;
      });

      const brickConf = convertToBrickConf(configList, containerConfig);
      onBrickChange(brickConf);
    }
  }, [
    config,
    containerConfig,
    dataSourceList,
    metricGroups,
    onBrickChange,
    viewAttrList,
    viewType,
  ]);

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
    const iframeWin = iframeRef.current?.contentWindow;
    if (!ready || !iframeWin) {
      return;
    }
    const observer = new ResizeObserver(() => {
      root.style.height = `${iframeWin.document.body.scrollHeight}px`;
    });
    observer.observe(iframeWin.document.body);
    return () => observer.disconnect();
  }, [ready, root]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    const iframeWin = iframeRef.current?.contentWindow as PreviewWindow;
    const onMessage = ({ data }: MessageEvent<ConfigMessage>) => {
      if (data?.channel === "pre-generated-config") {
        switch (data.type) {
          case "config-change":
            setConfig(data.payload);
            break;
          case "group-change":
            setGroupMap(
              (prev) =>
                new Map([
                  ...(prev ?? []),
                  [data.payload.id, data.payload.metrics],
                ])
            );
            break;
          case "order-change":
            orderedIdsRef.current = data.payload.orderedIds;
            break;
          case "selection-change":
            selectedIdsRef.current = data.payload.selectedIds;
            break;
        }
      }
    };
    iframeWin.addEventListener("message", onMessage);
    return () => {
      iframeWin.removeEventListener("message", onMessage);
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    // const deps = ["advanced", "visual-builder"];
    const pkgVisualBuilder = __secret_internals.getBrickPackagesById(
      "bricks/visual-builder"
    );
    if (!pkgVisualBuilder) {
      throw new Error(
        "Cannot find preview agent package: bricks/visual-builder"
      );
    }
    const inject = (iframeRef.current!.contentWindow as PreviewWindow)!
      ._preview_only_inject;

    const fixedPkgVisualBuilder = {
      ...pkgVisualBuilder,
      filePath: previewUrl
        ? new URL(
            pkgVisualBuilder.filePath,
            new URL(previewUrl, location.origin)
          ).toString()
        : `${location.origin}${getBasePath()}${
            window.PUBLIC_ROOT ?? ""
          }${pkgVisualBuilder.filePath}`,
    };

    Promise.allSettled([
      inject(
        "visual-builder.pre-generated-container",
        fixedPkgVisualBuilder,
        undefined,
        true
      ),
    ]).then(() => {
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

    const orderedIds = orderedIdsRef.current;
    const selectedIds = selectedIdsRef.current;
    const orderedList = orderedIds
      ? orderedIds
          .map((id) => dataSourceList.find((item) => item.id === id))
          .filter(Boolean)
      : dataSourceList;
    const selectedItems = selectedIds
      ? orderedList.filter((item) => selectedIds.includes(item.id))
      : (orderedList?.slice(0, 5) ?? []);
    const selectedRowKeys = selectedIds ?? selectedItems.map((attr) => attr.id);

    render(
      "yaml",
      {
        yaml: safeDump(
          [
            {
              brick: "eo-next-table",
              errorBoundary: true,
              properties: {
                injectChartV2Styles: true,
                pagination: false,
                rowSelection: true,
                rowKey: "id",
                rowDraggable: true,
                bordered: true,
                dataSource: {
                  list: orderedList,
                },
                selectedRowKeys,
                columns: [
                  ...(viewType === "chart"
                    ? [
                        {
                          title: "指标名",
                          dataIndex: "id",
                          key: "id",
                          width: "20%",
                        },
                        {
                          title: "指标别名",
                          dataIndex: "name",
                          key: "name",
                          width: "20%",
                        },
                      ]
                    : viewType === "grouped-chart"
                      ? [
                          {
                            title: "指标组",
                            dataIndex: "id",
                            key: "id",
                            width: "40%",
                            useBrick: {
                              brick: "eo-select",
                              properties: {
                                options: "<% CTX.metricOptions %>",
                                mode: "multiple",
                                value:
                                  "<% CTX.groupMap.get(DATA.cellData) ?? DATA.rowData.metrics.map((metric) => metric.id) %>",
                                dropdownHoist: true,
                              },
                              events: {
                                change: {
                                  action: "window.postMessage",
                                  args: [
                                    {
                                      channel: "pre-generated-config",
                                      type: "group-change",
                                      payload:
                                        "<% { id: DATA.cellData, metrics: EVENT.detail.value } %>",
                                    },
                                  ],
                                },
                              },
                            },
                          },
                        ]
                      : [
                          {
                            title: "ID",
                            dataIndex: "id",
                            key: "id",
                            width: "20%",
                          },
                          {
                            title: "名称",
                            dataIndex: "name",
                            key: "name",
                            width: "20%",
                          },
                        ]),
                  {
                    title: "预览",
                    dataIndex: "preview",
                    key: "preview",
                    useBrick: {
                      brick: "div",
                      children: dataSourceList?.flatMap<BrickConf>((item) => {
                        const meta = getConfigMeta(
                          viewType,
                          viewAttrList,
                          metricGroups,
                          item,
                          groupMap
                        );

                        let filteredCandidates:
                          | VisualConfig[]
                          | MetricVisualConfig[]
                          | undefined;
                        let dataSource: unknown;
                        if (meta.viewType === "grouped-chart") {
                          dataSource = mockList?.map((mock) =>
                            pick(mock, ["time", ...meta.groupedMetricKeys])
                          );
                          filteredCandidates = meta.metric.candidates?.filter(
                            (can) => can.size !== "small"
                          );
                        } else {
                          filteredCandidates = (item as Attr).candidates;
                          if (meta.viewType === "chart") {
                            dataSource = mockList?.map((item) =>
                              pick(item, ["time", meta.metric.metricKey])
                            );
                          } else {
                            dataSource = mockList?.[0] ?? {};
                          }
                        }

                        const bricks = filteredCandidates
                          .map((candidate) => {
                            const condition = `<%=
                                DATA.rowData.id === ${JSON.stringify(item.id)} &&
                                ${JSON.stringify(candidate.visualWeight)} === CTX.weightMap.get(${JSON.stringify(item.id)})
                              %>`;
                            const brick =
                              meta.viewType === "default"
                                ? convertToStoryboard(
                                    candidate as VisualConfig,
                                    (item as ObjectAttr).id
                                  )
                                : convertToChart(
                                    {
                                      ...(candidate as MetricVisualConfig),
                                      min: meta.counterMetricKey
                                        ? undefined
                                        : (candidate as MetricVisualConfig).min,
                                    },
                                    "<% DATA %>",
                                    meta.metric.metricKey,
                                    {
                                      unit: meta.metric.unit,
                                    },
                                    meta.groupedMetricKeys,
                                    meta.counterMetricKey
                                  );
                            if (brick) {
                              return {
                                if: condition,
                                brick: "visual-builder.pre-generated-container",
                                properties: {
                                  useBrick: brick,
                                  dataSource,
                                },
                              };
                            }
                          })
                          .filter(Boolean);

                        return bricks?.length
                          ? bricks
                          : {
                              if: `<% DATA.rowData.id === ${JSON.stringify(item.id)} %>`,
                              brick: "span",
                              properties: {
                                textContent: mockList?.[0]?.[item.id] ?? "",
                              },
                            };
                      }),
                    },
                  },
                  {
                    dataIndex: "operations",
                    key: "operations",
                    width: 81,
                    headerBrick: {
                      useBrick: {
                        brick: "eo-mini-actions",
                        properties: {
                          actions: `<%=
                            [
                              {
                                icon: {
                                  lib: "antd",
                                  icon: "minus",
                                },
                                event: "minus",
                                disabled: [...CTX.weightMap].every(([id, v]) => v <= CTX.availableWeights.get(id)[0]),
                              },
                              {
                                icon: {
                                  lib: "antd",
                                  icon: "plus",
                                },
                                event: "plus",
                                disabled: [...CTX.weightMap].every(([id, v]) => v >= CTX.availableWeights.get(id).slice(-1)[0]),
                              },
                            ]
                          %>`,
                        },
                        events: {
                          minus: {
                            action: "context.replace",
                            args: [
                              "weightMap",
                              `<% FN.updateWeightMap(CTX.weightMap, CTX.availableWeights, null, -1) %>`,
                            ],
                          },
                          plus: {
                            action: "context.replace",
                            args: [
                              "weightMap",
                              `<% FN.updateWeightMap(CTX.weightMap, CTX.availableWeights, null, 1) %>`,
                            ],
                          },
                        },
                      },
                    },
                    useBrick: {
                      if: "<% CTX.availableWeights.get(DATA.rowData.id)?.length %>",
                      brick: "eo-mini-actions",
                      properties: {
                        actions: `<%=
                          [
                            {
                              icon: {
                                lib: "antd",
                                icon: "minus",
                              },
                              event: "minus",
                              disabled: CTX.weightMap.get(DATA.rowData.id) <= CTX.availableWeights.get(DATA.rowData.id)[0],
                            },
                            {
                              icon: {
                                lib: "antd",
                                icon: "plus",
                              },
                              event: "plus",
                              disabled: CTX.weightMap.get(DATA.rowData.id) >= CTX.availableWeights.get(DATA.rowData.id).slice(-1)[0],
                            },
                          ]
                        %>`,
                      },
                      events: {
                        minus: {
                          action: "context.replace",
                          args: [
                            "weightMap",
                            `<% FN.updateWeightMap(CTX.weightMap, CTX.availableWeights, DATA.rowData.id, -1) %>`,
                          ],
                        },
                        plus: {
                          action: "context.replace",
                          args: [
                            "weightMap",
                            `<% FN.updateWeightMap(CTX.weightMap, CTX.availableWeights, DATA.rowData.id, 1) %>`,
                          ],
                        },
                      },
                    },
                  },
                ],
              },
              events: {
                "row.select": {
                  action: "context.replace",
                  args: ["selectedItems", "<%= EVENT.detail.rows %>"],
                },
                "row.drag": {
                  action: "context.replace",
                  args: [
                    "orderedIds",
                    "<%= EVENT.detail.list.map((attr) => attr.id) %>",
                  ],
                },
              },
            },
            {
              brick: "eo-event-agent",
              properties: {
                id: eventAgentId,
              },
              events: {
                trigger: {
                  action: "window.postMessage",
                  args: [
                    {
                      channel: "pre-generated-config",
                      type: "config-change",
                      payload:
                        "<% FN.getPreConfig(CTX.selectedItems, CTX.orderedIds, CTX.weightMap, CTX.groupMap) %>",
                    },
                  ],
                },
              },
              lifeCycle: {
                onPageLoad: {
                  target: `#${eventAgentId}`,
                  method: "trigger",
                },
              },
              portal: true,
              errorBoundary: true,
            },
          ],
          {
            skipInvalid: true,
          }
        ),
      },
      {
        theme: "light",
        uiVersion: "8.2",
        styleText: previewStyleText,
        context: [
          {
            name: "orderedIds",
            value: viewAttrList?.map((attr) => attr.id) ?? [],
            onChange: [
              {
                target: `#${eventAgentId}`,
                method: "trigger",
              },
              ...(viewType === "grouped-chart"
                ? [
                    {
                      action: "window.postMessage",
                      args: [
                        {
                          channel: "pre-generated-config",
                          type: "order-change",
                          payload: {
                            orderedIds: "<% EVENT.detail %>",
                          },
                        },
                      ],
                    },
                  ]
                : []),
            ],
          },
          {
            name: "selectedItems",
            value: selectedItems,
            onChange: [
              {
                target: `#${eventAgentId}`,
                method: "trigger",
              },
              ...(viewType === "grouped-chart"
                ? [
                    {
                      action: "window.postMessage",
                      args: [
                        {
                          channel: "pre-generated-config",
                          type: "selection-change",
                          payload: {
                            selectedIds:
                              "<% EVENT.detail.map((item) => item.id) %>",
                          },
                        },
                      ],
                    },
                  ]
                : []),
            ],
          },
          {
            name: "availableWeights",
            value: `<% new Map(${JSON.stringify(
              dataSourceList?.map((item) => [
                item.id,
                (viewType === "grouped-chart"
                  ? (item as GroupedMetric).metrics[0]
                  : (item as ObjectAttr)
                ).candidates
                  ?.filter(
                    (can) =>
                      viewType !== "grouped-chart" ||
                      (can as MetricVisualConfig).size !== "small"
                  )
                  .map((can) => can.visualWeight)
                  .sort((a, b) => a - b) ?? [],
              ]) ?? []
            )}) %>`,
          },
          {
            name: "weightMap",
            value: `<% new Map(${JSON.stringify(
              dataSourceList?.map((item) => [
                item.id,
                findNearestCandidate(
                  (viewType === "grouped-chart"
                    ? (item as GroupedMetric).metrics[0]
                    : (item as ObjectAttr)
                  ).candidates?.filter(
                    (can) =>
                      viewType !== "grouped-chart" ||
                      (can as MetricVisualConfig).size !== "small"
                  ) as BaseVisualConfig[],
                  viewType === "grouped-chart" ? 2 : 0
                )?.visualWeight,
              ]) ?? []
            )}) %>`,
            onChange: {
              target: `#${eventAgentId}`,
              method: "trigger",
            },
          },
          {
            name: "groupMap",
            value: `<% new Map(${JSON.stringify([...(groupMap ?? [])])}) %>`,
          },
          ...(viewType === "grouped-chart"
            ? [
                {
                  name: "metricOptions",
                  value: viewAttrList?.map((attr) => ({
                    label: attr.metricKey,
                    value: attr.id,
                  })),
                },
              ]
            : []),
        ],
        functions: [
          {
            name: "updateWeightMap",
            source: updateWeightMap,
          },
          {
            name: "getPreConfig",
            source: `
              function getPreConfig(selectedItems, orderedIds, weightMap, groupMap) {
                return {
                  selectedIds: selectedItems.map((item) => item.id),
                  orderedIds,
                  weightMapLiteral: [...weightMap],
                  groupMapLiteral: [...groupMap],
                };
              }
            `,
          },
        ],
      }
    );
  }, [
    attrList,
    containerConfig,
    injected,
    metricGroups,
    mockList,
    eventAgentId,
    dataSourceList,
    viewType,
    viewAttrList,
    groupMap,
  ]);

  return (
    <div className="container">
      <iframe
        ref={iframeRef}
        src={previewUrl ?? `${getBasePath()}_brick-preview-v3_/preview/`}
        loading="lazy"
        onLoad={handleIframeLoad}
      />
    </div>
  );
}

interface BaseVisualConfig {
  visualWeight: number;
}

function findNearestCandidate<T extends BaseVisualConfig>(
  candidates: T[] | undefined,
  weight: number
): T | undefined {
  return candidates?.reduce((nearest, candidate) => {
    if (
      !nearest ||
      Math.abs(candidate.visualWeight - weight) <
        Math.abs(nearest.visualWeight - weight)
    ) {
      return candidate;
    }
    return nearest;
  });
}

function buildGroupedMetrics(
  metrics: MetricAttr[],
  groups: MetricGroup[]
): GroupedMetric[] {
  const metricsMap = new Map(metrics.map((metric) => [metric.id, metric]));

  const results: GroupedMetric[] = [];

  groups.forEach((group, groupIndex) => {
    const result: MetricAttr[] = [];
    for (const metricName of group.metrics) {
      const metric = metricsMap.get(metricName);
      if (metric) {
        metricsMap.delete(metricName);
        result.push(metric);
      }
    }
    if (result.length) {
      results.push({
        id: groupIndex,
        group: group.group,
        metrics: result,
        counter: group.counter,
      });
    }
  });

  const nextGroupIndex = (results[results.length - 1]?.id ?? -1) + 1;

  results.push(
    ...[...metricsMap.values()].map((metric, index) => ({
      id: nextGroupIndex + index,
      group: "",
      metrics: [metric],
    }))
  );

  return results;
}

type ConfigMeta = DefaultConfigMeta | ChartConfigMeta | GroupedChartConfigMeta;

interface DefaultConfigMeta {
  viewType: "default";
  attr: ObjectAttr;
}

interface ChartConfigMeta {
  viewType: "chart";
  metric: MetricAttr;
  groupedMetricKeys?: undefined;
  counterMetricKey?: undefined;
}

interface GroupedChartConfigMeta {
  viewType: "grouped-chart";
  metric: MetricAttr;
  groupedMetricKeys: string[];
  counterMetricKey?: string;
}

function getConfigMeta(
  viewType: "default" | "chart" | "grouped-chart",
  viewAttrList: Attr[],
  metricGroups: MetricGroup[],
  item: Attr | GroupedMetric,
  groupMap: Map<number, string[]> | null
): ConfigMeta {
  if (viewType === "grouped-chart") {
    const group = item as GroupedMetric;

    const editedMetrics = groupMap?.get(group.id);
    let finalMetrics: MetricAttr[];
    if (editedMetrics) {
      finalMetrics = viewAttrList.filter((attr) =>
        editedMetrics.includes(attr.id)
      ) as MetricAttr[];
    } else {
      finalMetrics = group.metrics;
    }

    const attr = finalMetrics[0];
    const groupedMetricKeys = finalMetrics.map((metric) => metric.metricKey);

    // Set counter metric only if it matches the original metric groups
    let counterMetric: MetricAttr | undefined;
    if (group.counter && finalMetrics.length === 2) {
      for (const g of metricGroups) {
        if (
          g.metrics.length === 2 &&
          g.counter === group.counter &&
          finalMetrics.every((m) => g.metrics.includes(m.id))
        ) {
          counterMetric = finalMetrics.find(
            (metric) => metric.id === group.counter
          );
          break;
        }
      }
    }

    return {
      viewType,
      metric: attr,
      groupedMetricKeys,
      counterMetricKey: counterMetric?.metricKey,
    };
  }
  if (viewType === "chart") {
    const attr = item as MetricAttr;
    return {
      viewType,
      metric: attr,
    };
  }
  return { viewType, attr: item as ObjectAttr };
}
