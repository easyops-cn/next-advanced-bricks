import React, { useEffect, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { Worker, Viewer } from "@react-pdf-viewer/core";

// Plugins
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const { defineElement, property } = createDecorators();

export interface PdfViewerProps {
  url: string;
  page?: number;
  search?: string;
  viewerStyle?: React.CSSProperties | undefined;
}

/**
 * PDF 文件预览器，支持分页跳转和关键字高亮搜索
 * @author developer
 * @category display
 */
export
@defineElement("advanced.pdf-viewer", {
  // 样式文件引入报错，使用非shadow dom模式正常
  shadowOptions: false,
})
class PdfViewer extends ReactNextElement implements PdfViewerProps {
  /** PDF 文件的访问地址 */
  @property()
  accessor url!: string;

  /** 初始显示的页码（从 1 开始），内部会自动转换为从 0 开始的索引 */
  @property({
    type: Number,
  })
  accessor page: number | undefined;

  /** 文档加载后自动高亮的搜索关键字 */
  @property()
  accessor search: string | undefined;

  /** 查看器容器的内联样式，常用于设置高度（如 { height: "500px" }） */
  @property({
    attribute: false,
  })
  accessor viewerStyle: React.CSSProperties | undefined;

  render() {
    return (
      <PdfViewerComponent
        url={this.url}
        page={this.page ? this.page - 1 : 0}
        search={this.search}
        viewerStyle={this.viewerStyle}
      />
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PdfViewerComponentProps extends PdfViewerProps {
  // Define event handlers here.
}

export function PdfViewerComponent({
  url,
  search,
  page,
  viewerStyle,
}: PdfViewerComponentProps) {
  // https://react-pdf-viewer.dev/examples/jump-to-the-first-match-of-pre-defined-keywords-automatically/
  const [isDocumentLoaded, setDocumentLoaded] = useState(false);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    if (isDocumentLoaded && search) {
      defaultLayoutPluginInstance.toolbarPluginInstance.searchPluginInstance.highlight(
        {
          keyword: search,
        }
      );
    }
  }, [isDocumentLoaded, search]);

  return (
    // See: https://react-pdf-viewer.dev/examples/compile-and-set-the-worker-source-with-webpack/
    <Worker
      workerUrl={`${process.env.NODE_ENV === "test" ? "" : __webpack_public_path__}workers/pdf.worker.min.js`}
    >
      <div style={viewerStyle}>
        <Viewer
          fileUrl={url}
          initialPage={page}
          plugins={[defaultLayoutPluginInstance]}
          onDocumentLoad={() => setDocumentLoaded(true)}
        />
      </div>
    </Worker>
  );
}
