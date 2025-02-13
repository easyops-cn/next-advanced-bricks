import React, { useCallback, useEffect, useRef, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { getBasePath } from "@next-core/runtime";
import type { PreviewWindow } from "@next-core/preview/types";
import type { BrickConf } from "@next-core/types";
import { safeDump } from "js-yaml";
import "@next-core/theme";
import type { VisualConfig } from "../raw-data-preview/raw-data-interfaces";
import styleText from "../pre-generated-config/styles.shadow.css";
import previewStyleText from "../pre-generated-config/preview.shadow.css";
import {
  convertToStoryboard,
  lowLevelConvertToStoryboard,
} from "../raw-data-preview/convert";

const { defineElement, property } = createDecorators();

export interface ObjectAttr {
  id: string;
  name: string;
  enum?: unknown[];
  config?: VisualConfig;
}

export interface PreGeneratedConfigPreviewProps {
  previewUrl?: string;
  container?: ContainerType;
  attrList?: ObjectAttr[];
  mockList?: Record<string, unknown>[];
}

export type ContainerType = "table" | "descriptions";

/**
 * 构件 `visual-builder.pre-generated-config-preview`
 */
export
@defineElement("visual-builder.pre-generated-config-preview", {
  styleTexts: [styleText],
})
class PreGeneratedConfigPreview
  extends ReactNextElement
  implements PreGeneratedConfigPreviewProps
{
  @property()
  accessor previewUrl: string | undefined;

  @property()
  accessor container: ContainerType | undefined;

  @property({ attribute: false })
  accessor attrList: ObjectAttr[] | undefined;

  @property({ attribute: false })
  accessor mockList: Record<string, unknown>[] | undefined;

  render() {
    return (
      <PreGeneratedConfigPreviewComponent
        root={this}
        previewUrl={this.previewUrl}
        container={this.container}
        attrList={this.attrList}
        mockList={this.mockList}
      />
    );
  }
}

export interface PreGeneratedConfigPreviewComponentProps
  extends PreGeneratedConfigPreviewProps {
  root: HTMLElement;
}

export function PreGeneratedConfigPreviewComponent({
  root,
  previewUrl,
  container,
  attrList,
  mockList,
}: PreGeneratedConfigPreviewComponentProps) {
  const iframeRef = useRef<HTMLIFrameElement>();
  const [ready, setReady] = useState(false);

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
    const render = (iframeRef.current?.contentWindow as PreviewWindow)
      ?._preview_only_render;
    if (!ready || !render || !attrList) {
      return;
    }

    let brickConf: BrickConf;

    switch (container) {
      case "descriptions":
        brickConf = {
          brick: "eo-descriptions",
          errorBoundary: true,
          properties: {
            column: 2,
            list: attrList.map((attr) => {
              const item: Record<string, unknown> = {
                label: attr.name,
              };
              if (attr.config) {
                item.useBrick = convertToStoryboard(attr.config, attr.id);
              }
              return item;
            }),
            dataSource: mockList?.[0],
          },
        };
        break;
      default:
        brickConf = {
          brick: "eo-next-table",
          errorBoundary: true,
          properties: {
            rowKey: attrList[0]?.id,
            columns: attrList.map((attr) => {
              const col: Record<string, unknown> = {
                title: attr.name,
                dataIndex: attr.id,
                key: attr.id,
              };
              if (attr.config) {
                col.useBrick = lowLevelConvertToStoryboard(
                  attr.config,
                  ".cellData"
                );
              }
              return col;
            }),
            dataSource: {
              list: mockList,
              page: 1,
              pageSize: 20,
            },
          },
        };
    }

    render(
      "yaml",
      {
        yaml: safeDump([brickConf], {
          skipInvalid: true,
        }),
      },
      {
        theme: "light",
        uiVersion: "8.2",
        styleText: previewStyleText,
      }
    );
  }, [ready, attrList, mockList, container]);

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
