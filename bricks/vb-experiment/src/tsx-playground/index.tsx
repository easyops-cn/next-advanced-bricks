import React, {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { httpErrorToString, unstable_createRoot } from "@next-core/runtime";
import { ReactNextElement } from "@next-core/react-element";
import { asyncWrapBrick } from "@next-core/react-runtime";
import { uniqueId } from "lodash";
import type {
  CodeEditor,
  CodeEditorProps,
  ExtraLib,
  ExtraMarker,
} from "@next-bricks/vs/code-editor";
import nextTsxDefinition from "@next-tsx/core/index.d.ts?raw";
import componentsDefinition from "@next-tsx/converter/lib/components.d.ts?raw";
import { convertView, type ConvertResult } from "@next-tsx/converter";
import type { ParsedApp, SourceFile } from "@next-tsx/parser";
import "@next-core/theme";
import styles from "./styles.module.css";
import { getRemoteTsxParserWorker } from "./workers/tsxParser.js";
import { createPortal } from "./createPortal.js";

interface CodeEditorEvents {
  "code.change": CustomEvent<string>;
}

interface CodeEditorMapEvents {
  onCodeChange: "code.change";
}

const AsyncWrappedCodeEditor = React.lazy(async () => ({
  default: await asyncWrapBrick<
    CodeEditor,
    CodeEditorProps,
    CodeEditorEvents,
    CodeEditorMapEvents
  >("vs.code-editor", {
    onCodeChange: "code.change",
  }),
}));

const BUILTIN_LIBS: ExtraLib[] = [
  {
    filePath: "/node_modules/next-tsx/components.d.ts",
    content: componentsDefinition.replaceAll("export interface", "interface"),
  },
  {
    filePath: "/node_modules/next-tsx/package.json",
    content: JSON.stringify({
      name: "next-tsx",
      types: "./index.d.ts",
    }),
  },
  {
    filePath: "/node_modules/next-tsx/index.d.ts",
    content: nextTsxDefinition,
  },
];

const { defineElement, property, event } = createDecorators();

export interface TsxPlaygroundProps {
  source?: string;
  extraLibs?: ExtraLib[];
  viewLibs?: SourceFile[];
  withoutWrapper?: boolean;
  allowAnyBricks?: boolean;
}

/**
 * TSX 视图编辑器与实时预览的集成 Playground，支持用 TSX 语法编写视图，并即时渲染到右侧预览区
 */
export
@defineElement("vb-experiment.tsx-playground", {
  // Monaco editor does not work well with shadow DOM
  shadowOptions: false,
})
class TsxPlayground extends ReactNextElement implements TsxPlaygroundProps {
  /**
   * 初始代码内容，仅在首次渲染时有效，后续更改不会同步到编辑器
   */
  @property({ attribute: false })
  accessor source: string | undefined;

  /**
   * 额外注入到编辑器的类型声明库，用于提供代码补全和类型检查
   */
  @property({ attribute: false })
  accessor extraLibs: ExtraLib[] | undefined;

  /**
   * 额外的视图库源文件，会合并到类型声明中，并在解析视图时作为依赖提供
   */
  @property({ attribute: false })
  accessor viewLibs: SourceFile[] | undefined;

  /**
   * 是否跳过顶层 wrapper 包裹，启用后视图直接渲染为裸砖块列表
   */
  @property({ type: Boolean })
  accessor withoutWrapper: boolean | undefined;

  /**
   * 是否允许使用任意砖块，默认仅允许 next-tsx 白名单砖块
   */
  @property({ type: Boolean })
  accessor allowAnyBricks: boolean | undefined;

  /**
   * @detail 当前编辑器中的代码字符串
   * @description 编辑器内容变化时触发
   */
  @event({ type: "change" })
  accessor #change!: EventEmitter<string>;

  #handleChange = (value: string) => {
    this.#change?.emit(value);
  };

  render() {
    return (
      <TsxPlaygroundComponent
        source={this.source}
        extraLibs={this.extraLibs}
        viewLibs={this.viewLibs}
        withoutWrapper={this.withoutWrapper}
        allowAnyBricks={this.allowAnyBricks}
        onChange={this.#handleChange}
      />
    );
  }
}

interface TsxPlaygroundComponentProps extends TsxPlaygroundProps {
  onChange: (value: string) => void;
}

function convertSeverity(
  severity: "notice" | "warning" | "error" | "fatal"
): "Hint" | "Info" | "Warning" | "Error" {
  switch (severity) {
    case "notice":
      return "Hint";
    case "warning":
      return "Warning";
    case "error":
      return "Error";
    case "fatal":
      return "Error";
  }
  return severity;
}

function TsxPlaygroundComponent({
  source,
  extraLibs,
  withoutWrapper,
  allowAnyBricks,
  viewLibs,
  onChange,
}: TsxPlaygroundComponentProps) {
  const [code, setCode] = useState(source ?? "");
  const deferredCode = useDeferredValue(code);
  const [markers, setMarkers] = useState<ExtraMarker[] | undefined>();
  const [view, setView] = useState<ParsedApp | undefined>();

  const allLibs = useMemo(
    () => [...BUILTIN_LIBS, ...(extraLibs ?? []), ...(viewLibs ?? [])],
    [extraLibs, viewLibs]
  );

  const handleCodeChange = useCallback(
    (e: CustomEvent<string>) => {
      setCode(e.detail);
      onChange(e.detail);
    },
    [onChange]
  );
  useEffect(() => {
    let ignore = false;
    (async function run() {
      const worker = await getRemoteTsxParserWorker();
      if (ignore) {
        return;
      }
      const result = await worker.parseView(deferredCode, { libs: viewLibs });
      if (ignore) {
        return;
      }
      setView(result);
      const withNodeErrors = result.errors.filter((err) => !!err.node);
      if (withNodeErrors.length > 0) {
        setMarkers(
          withNodeErrors.map((error) => ({
            message: error.message,
            severity: convertSeverity(error.severity),
            startLineNumber: error.node!.loc!.start.line,
            startColumn: error.node!.loc!.start.column + 1,
            endLineNumber: error.node!.loc!.end.line,
            endColumn: error.node!.loc!.end.column + 1,
          }))
        );
      } else {
        setMarkers(undefined);
      }
      if (ignore) {
        return;
      }
    })();
    return () => {
      ignore = true;
    };
  }, [deferredCode]);

  const rootId = useMemo(() => uniqueId(), []);
  const ref = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) {
      return;
    }
    const portal = createPortal(rootId);
    const root = unstable_createRoot(container, {
      portal,
      supportsUseChildren: true,
    } as any);
    rootRef.current = root;

    return () => {
      root.unmount();
      portal.remove();
      rootRef.current = null;
    };
  }, [rootId]);

  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!view) {
        return;
      }
      // setLoading(true);
      let convertedView: ConvertResult | undefined;
      try {
        convertedView = await convertView(view, {
          rootId,
          expanded: true,
          withoutWrapper,
          allowAnyBricks,
        });
        if (ignore) {
          return;
        }
        const { brick, context, functions, templates } = convertedView ?? {};
        await rootRef.current?.render(brick ?? [], {
          context,
          functions,
          templates,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to render view:", error);
        rootRef.current?.render({
          brick: customElements.get("easyops-default-error")
            ? "easyops-default-error"
            : "div",
          properties: {
            errorTitle: "解析失败",
            dataset: {
              errorBoundary: "",
            },
            style: {
              color: "var(--color-error)",
            },
          },
          children: [
            {
              brick: "div",
              properties: {
                textContent: httpErrorToString(error),
              },
            },
          ],
        });
      }
      // if (!ignore) {
      //   setLoading(false);
      // }
    })();

    return () => {
      ignore = true;
    };
  }, [rootId, view, withoutWrapper, allowAnyBricks]);

  return (
    <div className={styles.container}>
      <div className={styles.editor}>
        <Suspense fallback="Loading...">
          <AsyncWrappedCodeEditor
            value={source}
            onCodeChange={handleCodeChange}
            language="typescript"
            uri="file:///View.tsx"
            automaticLayout="fit-container"
            theme="tm-vs-dark"
            extraLibs={allLibs}
            extraMarkers={markers}
            data-override-theme="dark-v2"
          />
        </Suspense>
      </div>
      <div className={styles.preview}>
        <div data-root-id={rootId} ref={ref} />
      </div>
    </div>
  );
}
