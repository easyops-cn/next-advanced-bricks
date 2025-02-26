import React, { useCallback, useEffect, useRef, useState } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { __secret_internals, getBasePath } from "@next-core/runtime";
import type { PreviewWindow } from "@next-core/preview/types";
import { safeDump } from "js-yaml";
import type { BrickConf } from "@next-core/types";
import { uniqueId } from "lodash";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { /* K, */ NS, locales /* , t */ } from "./i18n.js";
import type { VisualConfig } from "../raw-data-preview/raw-data-interfaces.js";
import { convertToStoryboard } from "../raw-data-preview/convert.js";
import { convertToBrickConf } from "./convertToBrickConf.js";
import updateWeightMap from "./updateWeightMap.js?raw";
import styleText from "./styles.shadow.css";
import previewStyleText from "./preview.shadow.css";

initializeI18n(NS, locales);

const { defineElement, property, event } = createDecorators();

export interface PreGeneratedConfigProps {
  previewUrl?: string;
  attrList?: ObjectAttr[];
  mockList?: Record<string, unknown>[];
  containerConfig?: ContainerConfig;
}

export interface ObjectAttr {
  id: string;
  name: string;
  enum?: unknown[];
  candidates?: VisualConfig[];
}

interface BaseConfigMessage {
  channel: "pre-generated-config";
  id?: string; // The unique id for message callbacks
}

interface ConfigChangeMessage extends BaseConfigMessage {
  type: "config-change";
  payload: AttrConfig[];
}

interface GetConfigMessage extends BaseConfigMessage {
  type: "get-config";
}

interface GetConfigResponseMessage extends BaseConfigMessage {
  type: "get-config-response";
  payload: AttrConfig[];
}

type ConfigMessage =
  | ConfigChangeMessage
  | GetConfigMessage
  | GetConfigResponseMessage;

export interface AttrConfig {
  id: string;
  name: string;
  config?: VisualConfig;
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
  accessor containerConfig: ContainerConfig | undefined;

  @event({ type: "change" })
  accessor #changeEvent: EventEmitter<AttrConfig[]>;

  @event({ type: "brick.change" })
  accessor #brickChangeEvent: EventEmitter<BrickConf | null>;

  #handleChange = (payload: AttrConfig[]) => {
    this.#changeEvent.emit(payload);
  };

  #handleBrickChange = (payload: BrickConf | null) => {
    this.#brickChangeEvent.emit(payload);
  };

  render() {
    return (
      <PreGeneratedConfigComponent
        previewUrl={this.previewUrl}
        attrList={this.attrList}
        mockList={this.mockList}
        containerConfig={this.containerConfig}
        onChange={this.#handleChange}
        onBrickChange={this.#handleBrickChange}
        root={this}
      />
    );
  }
}

export interface PreGeneratedConfigComponentProps
  extends PreGeneratedConfigProps {
  root: HTMLElement;
  onChange: (payload: AttrConfig[]) => void;
  onBrickChange: (payload: BrickConf | null) => void;
}

export function PreGeneratedConfigComponent({
  previewUrl,
  attrList,
  mockList,
  containerConfig,
  root,
  onChange,
  onBrickChange,
}: PreGeneratedConfigComponentProps) {
  const iframeRef = useRef<HTMLIFrameElement>();
  const [ready, setReady] = useState(false);
  const [injected, setInjected] = useState(false);
  const [config, setConfig] = useState<AttrConfig[] | null>(null);

  useEffect(() => {
    if (config) {
      onChange(config);
    }
  }, [config, onChange]);

  useEffect(() => {
    if (config) {
      const brickConf = convertToBrickConf(config, containerConfig);
      onBrickChange(brickConf);
    }
  }, [config, containerConfig, onBrickChange]);

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

    const initialSelectedAttrs = attrList?.slice(0, 5) ?? [];
    const selectedRowKeys = initialSelectedAttrs.map((attr) => attr.id);
    const eventAgentId = uniqueId("event-agent-");

    render(
      "yaml",
      {
        yaml: safeDump(
          [
            {
              brick: "eo-next-table",
              errorBoundary: true,
              properties: {
                pagination: false,
                rowSelection: true,
                rowKey: "id",
                rowDraggable: true,
                bordered: true,
                dataSource: {
                  list: attrList,
                },
                selectedRowKeys,
                columns: [
                  {
                    title: "ID",
                    dataIndex: "id",
                    key: "id",
                    width: "20%",
                  },
                  {
                    title: "Name",
                    dataIndex: "name",
                    key: "name",
                    width: "20%",
                  },
                  {
                    title: "Preview",
                    dataIndex: "preview",
                    key: "preview",
                    colSpan: 2,
                    useBrick: {
                      brick: "div",
                      children: attrList?.flatMap<BrickConf>((attr) => {
                        const bricks = attr.candidates
                          ?.map((candidate) => {
                            const condition = `<%=
                          DATA.rowData.id === ${JSON.stringify(attr.id)} &&
                          ${JSON.stringify(candidate.visualWeight)} === CTX.weightMap.get(${JSON.stringify(attr.id)})
                        %>`;
                            const brick = convertToStoryboard(
                              candidate,
                              attr.id
                            );
                            if (brick) {
                              return {
                                if: condition,
                                brick: "visual-builder.pre-generated-container",
                                properties: {
                                  useBrick: brick,
                                  dataSource: mockList?.[0] ?? {},
                                },
                              };
                            }
                          })
                          .filter(Boolean);

                        return bricks?.length
                          ? bricks
                          : {
                              if: `<% DATA.rowData.id === ${JSON.stringify(attr.id)} %>`,
                              brick: "span",
                              properties: {
                                textContent: mockList?.[0]?.[attr.id] ?? "",
                              },
                            };
                      }),
                    },
                  },
                  {
                    dataIndex: "operations",
                    key: "operations",
                    colSpan: 0,
                    width: 81,
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
                  args: ["selectedAttrs", "<%= EVENT.detail.rows %>"],
                },
                "row.drag": {
                  action: "context.replace",
                  args: [
                    "orderedAttrIds",
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
                        "<% FN.getConfig(CTX.selectedAttrs, CTX.orderedAttrIds, CTX.weightMap) %>",
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
            {
              brick: "eo-message-listener",
              properties: {
                sameOrigin: true,
              },
              events: {
                message: {
                  if: "<% EVENT.detail.data?.channel === 'pre-generated-config' && EVENT.detail.data.type === 'get-config' %>",
                  action: "window.postMessage",
                  args: [
                    {
                      channel: "pre-generated-config",
                      type: "get-config-response",
                      id: "<%= EVENT.detail.data.id %>",
                      payload:
                        "<% FN.getConfig(CTX.selectedAttrs, CTX.orderedAttrIds, CTX.weightMap) %>",
                    },
                  ],
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
            name: "orderedAttrIds",
            value: attrList?.map((attr) => attr.id) ?? [],
            onChange: {
              target: `#${eventAgentId}`,
              method: "trigger",
            },
          },
          {
            name: "selectedAttrs",
            value: initialSelectedAttrs,
            onChange: {
              target: `#${eventAgentId}`,
              method: "trigger",
            },
          },
          {
            name: "availableWeights",
            value: `<% new Map(${JSON.stringify(
              attrList?.map((attr) => [
                attr.id,
                attr.candidates
                  ?.map((can) => can.visualWeight)
                  .sort((a, b) => a - b) ?? [],
              ]) ?? []
            )}) %>`,
          },
          {
            name: "weightMap",
            value: `<% new Map(${JSON.stringify(attrList?.map((attr) => [attr.id, findNearestCandidate(attr.candidates, 0)?.visualWeight]) ?? [])}) %>`,
            onChange: {
              target: `#${eventAgentId}`,
              method: "trigger",
            },
          },
        ],
        functions: [
          {
            name: "updateWeightMap",
            source: updateWeightMap,
          },
          {
            name: "getConfig",
            source: `
              function getConfig(selectedAttrs, orderedAttrIds, weightMap) {
                return selectedAttrs.map((attr) => ({
                  id: attr.id,
                  name: attr.name,
                  config: attr.candidates?.find((can) => can.visualWeight === weightMap.get(attr.id)),
                })).sort((a, b) => orderedAttrIds.indexOf(a.id) - orderedAttrIds.indexOf(b.id));
              }
            `,
          },
        ],
      }
    );
  }, [attrList, injected, mockList]);

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

function findNearestCandidate(
  candidates: VisualConfig[] | undefined,
  weight: number
): VisualConfig | undefined {
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
