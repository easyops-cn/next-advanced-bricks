import React, { useCallback, useEffect, useRef, useState } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import type { BrickConf, ContextConf, MicroApp } from "@next-core/types";
import classNames from "classnames";
import { getBasePath } from "@next-core/runtime";
import type { PreviewWindow } from "@next-core/preview/types";
import { JSON_SCHEMA, safeDump } from "js-yaml";
import { __compat_internals } from "../shared/compat_internals";
import type { VisualConfig } from "./raw-metric-interfaces";
// import { convertToStoryboard } from "./convert";
import styleText from "./styles.shadow.css";
import sharedPreviewStyleText from "../raw-data-preview/preview.shadow.css";
import previewStyleText from "./preview.shadow.css";

const { defineElement, property, event } = createDecorators();

export interface RawMetricPreviewProps {
  previewUrl?: string;
  generations?: MetricGeneration[];
  // mocks?: Record<string, unknown>;
  busy?: boolean;
  category?: PreviewCategory;
  theme?: string;
  uiVersion?: string;
  app?: MicroApp;
}

export interface MetricGeneration {
  generationId?: string;
  objectId: string;
  objectName: string;
  propertyId: string;
  propertyName: string;
  // propertyType?: string;
  // propertyValues?: unknown[];
  propertyInstanceId?: string;
  comment?: string;
  approved?: boolean;
  candidates: VisualConfig[] | null;
  mockData: unknown[];
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

interface ViewAttrPromptMessage extends BasePreviewMessage {
  type: "viewAttrPrompt";
  payload: MetricGeneration;
}

interface ResizeMessage extends BasePreviewMessage {
  type: "resize";
  payload: {
    width: number;
    height: number;
  };
}

interface UpdatePropertyApproveStateMessage extends BasePreviewMessage {
  type: "updatePropertyApproveState";
  payload: string[];
}

type PreviewMessage =
  | CommentMessage
  | ApproveMessage
  | ViewAttrPromptMessage
  | ResizeMessage
  | UpdatePropertyApproveStateMessage;

export type PreviewCategory =
  | "detail-item"
  | "form-item"
  | "table-column"
  | "card-item"
  | "metric-item"
  | "value";

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

  // @property({ attribute: false })
  // accessor mocks: Record<string, unknown> | undefined;

  @property({ type: Boolean })
  accessor busy: boolean | undefined;

  /**
   * @default "value"
   */
  @property()
  accessor category: PreviewCategory | undefined;

  @property()
  accessor theme: string | undefined;

  @property()
  accessor uiVersion: string | undefined;

  @property()
  accessor app: MicroApp | undefined;

  @event({ type: "comment" })
  accessor #commentEvent: EventEmitter<CommentDetail>;

  #handleComment = (detail: CommentDetail) => {
    this.#commentEvent.emit(detail);
  };

  @event({ type: "approve" })
  accessor #approveEvent: EventEmitter<ApproveDetail>;

  #handleApprove = (detail: ApproveDetail) => {
    this.#approveEvent.emit(detail);
  };

  @event({ type: "view.attr.prompt" })
  accessor #viewAttrPromptEvent: EventEmitter<MetricGeneration>;

  #handleViewAttrPrompt = (detail: MetricGeneration) => {
    this.#viewAttrPromptEvent.emit(detail);
  };

  render() {
    return (
      <RawMetricPreviewComponent
        root={this}
        previewUrl={this.previewUrl}
        generations={this.generations}
        // mocks={this.mocks}
        busy={this.busy}
        category={this.category}
        theme={this.theme}
        uiVersion={this.uiVersion}
        app={this.app}
        onComment={this.#handleComment}
        onApprove={this.#handleApprove}
        onViewAttrPrompt={this.#handleViewAttrPrompt}
      />
    );
  }
}

export interface RawMetricPreviewComponentProps extends RawMetricPreviewProps {
  root: HTMLElement;
  onComment: (detail: CommentDetail) => void;
  onApprove: (detail: ApproveDetail) => void;
  onViewAttrPrompt: (detail: MetricGeneration) => void;
}

export function RawMetricPreviewComponent({
  root,
  previewUrl,
  generations,
  // mocks,
  busy,
  category,
  theme,
  uiVersion,
  app,
  onComment,
  onApprove,
  onViewAttrPrompt,
}: RawMetricPreviewComponentProps) {
  const iframeRef = useRef<HTMLIFrameElement>();
  const [ready, setReady] = useState(false);
  const [injected, setInjected] = useState(false);
  // const propertyToggleStateRef = useRef<string[]>([]);
  // const propertyExpandStateRef = useRef<string[]>([]);
  const propertyApproveStateRef = useRef<string[]>([]);

  useEffect(() => {
    propertyApproveStateRef.current =
      generations
        ?.filter((generation) => generation.approved)
        .map((generation) => generation.propertyId) ?? [];
  }, [generations]);

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
            case "comment":
              onComment(data.payload);
              break;
            case "approve":
              onApprove(data.payload);
              break;
            case "viewAttrPrompt":
              onViewAttrPrompt(data.payload);
              break;
            case "resize":
              root.style.height = `${data.payload.height + 2}px`;
              break;
            case "updatePropertyApproveState":
              propertyApproveStateRef.current = data.payload;
              break;
          }
        }
      };
      iframeWin.addEventListener("message", onMessage);
      return () => {
        iframeWin.removeEventListener("message", onMessage);
      };
    }
  }, [onApprove, onComment, onViewAttrPrompt, ready, root]);

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
      {
        brick: "div",
        properties: {
          textContent: "确认",
          className: "head-cell",
        },
      },
      {
        brick: "div",
        properties: {
          className: "head-cell last-col-cell",
        },
        children: [
          {
            brick: "span",
            properties: {
              textContent: "批注",
            },
          },
          {
            brick: "span",
            properties: {
              className: "tips",
              textContent: "（补充提示词，按住 ⌘ 或 ctrl + 回车提交）",
            },
          },
        ],
      },
    ];
    const table: BrickConf & { context?: ContextConf[] } = {
      brick: "visual-builder.pre-generated-table-view",
      context: [
        {
          name: "propertyApproveState",
          value: propertyApproveStateRef.current,
          onChange: {
            action: "window.postMessage",
            args: [
              {
                channel: "raw-metric-preview",
                type: "updatePropertyApproveState",
                payload: "<% CTX.propertyApproveState %>",
              },
            ],
          },
        },
        {
          name: "busy",
        },
      ],
      properties: {
        style: {
          gridTemplateColumns:
            "minmax(120px, 1fr) minmax(120px, 0.6fr) 32px repeat(4, 1fr) auto 1fr",
        },
      },
      children: tableChildren,
    };

    for (let i = 0, size = generations.length; i < size; i++) {
      const generation = generations[i];
      const isLastRow = i === size - 1;

      const candidatesByVisualWeight = new Map<number, VisualConfig>();
      for (const candidate of generation.candidates ?? []) {
        candidatesByVisualWeight.set(candidate.visualWeight ?? 0, candidate);
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
                textContent: `${generation.propertyName ?? ""}`,
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

      // 生成的编排
      for (let i = -1; i < 3; i++) {
        // const candidate = candidatesByVisualWeight.get(i);

        let brick: BrickConf;
        // if (candidate) {
        //   brick = convertToStoryboard(candidate, generation.propertyId);
        // }
        if (i === 0) {
          brick = {
            brick: "eo-mini-line-chart",
            properties: {
              data: "<% DATA %>",
              xField: "time",
              yField: generation.propertyId,
              lineColor: "var(--palette-orange-5)",
            },
          };
        } else if (i === 1) {
          brick = {
            brick: "chart-v2.time-series-chart",
            properties: {
              data: "<% DATA %>",
              xField: "time",
              yField: generation.propertyId,
              lineColor: "var(--palette-orange-5)",
              height: 200,
              width: 400,
              timeFormat: "HH:mm",
            },
          };
        }

        tableChildren.push({
          brick: "div",
          properties: {
            className: classNames("body-cell", {
              "last-row-cell": isLastRow,
            }),
            style: {
              justifyContent: "center",
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
                        dataSource: generation.mockData?.map(
                          (value, index) => ({
                            time:
                              Math.round(+new Date() / 1000) -
                              86400 +
                              index * 300,
                            [generation.propertyId]: value,
                          })
                        ),
                      },
                      errorBoundary: true,
                    },
                  ]
                : undefined,
            },
          ],
        });
      }

      tableChildren.push(
        {
          // 确认 checkbox
          brick: "div",
          properties: {
            className: classNames("body-cell", {
              "last-row-cell": isLastRow,
            }),
          },
          children: generation.candidates
            ? [
                {
                  brick: "eo-checkbox",
                  properties: {
                    value: `<%= CTX.propertyApproveState.includes(${JSON.stringify(generation.propertyId)}) ? ["approved"] : [] %>`,
                    options: [{ label: "", value: "approved" }],
                    disabled: `<%= CTX.busy || ${JSON.stringify(!generation.generationId)} %>`,
                  },
                  events: {
                    change: [
                      {
                        action: "window.postMessage",
                        args: [
                          {
                            channel: "raw-metric-preview",
                            type: "approve",
                            payload: {
                              approved: "<% EVENT.detail.length > 0 %>",
                              propertyInstanceId: generation.propertyInstanceId,
                            },
                          },
                        ],
                      },
                      {
                        action: "context.replace",
                        args: [
                          "propertyApproveState",
                          `<%
                            EVENT.detail.length > 0
                              ? CTX.propertyApproveState.concat(${JSON.stringify(generation.propertyId)})
                              : CTX.propertyApproveState.filter((id) => id !== ${JSON.stringify(generation.propertyId)})
                          %>`,
                        ],
                      },
                    ],
                  },
                },
              ]
            : undefined,
        },
        {
          // 批注 textarea
          brick: "div",
          properties: {
            className: classNames("body-cell", {
              "last-col-cell": true,
              "last-row-cell": isLastRow,
            }),
          },
          children: generation.candidates
            ? [
                {
                  brick: "eo-textarea",
                  properties: {
                    value: generation.comment
                      ? `<% ${JSON.stringify(generation.comment)} %>`
                      : undefined,
                    autoSize: true,
                    style: {
                      width: "100%",
                    },
                    disabled: `<%= CTX.busy || ${JSON.stringify(!generation.generationId)} || CTX.propertyApproveState.includes(${JSON.stringify(generation.propertyId)}) %>`,
                  },
                  events: {
                    keydown: {
                      if: "<% EVENT.code === 'Enter' && (EVENT.metaKey || EVENT.ctrlKey) %>",
                      action: "window.postMessage",
                      args: [
                        {
                          channel: "raw-metric-preview",
                          type: "comment",
                          payload: {
                            comment: "<% EVENT.target.value %>",
                            propertyInstanceId: generation.propertyInstanceId,
                          },
                        },
                      ],
                    },
                  },
                },
              ]
            : undefined,
        }
      );
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
  }, [app, injected, generations, theme, uiVersion, category]);

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
