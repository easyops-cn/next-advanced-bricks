import React, {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { asyncWrapBrick } from "@next-core/react-runtime";
import type { Storyboard } from "@next-core/types";
import { uniqueId } from "lodash";
import type {
  CodeEditor,
  CodeEditorProps,
  ExtraLib,
  ExtraMarker,
} from "@next-bricks/vs/code-editor";
import nextTsxDefinition from "@next-tsx/core/index.d.ts?raw";
import componentsDefinition from "@next-tsx/converter/lib/components.d.ts?raw";
import { convertApp, type ConvertedApp } from "@next-tsx/converter";
import type { ParsedApp } from "@next-tsx/parser";
import "@next-core/theme";
import styles from "./styles.module.css";
import { getRemoteTsxParserWorker } from "../tsx-playground/workers/tsxParser.js";
import type { AppPreview, AppPreviewProps } from "../app-preview/index.js";

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

const WrappedAppPreview = wrapBrick<AppPreview, AppPreviewProps>(
  "vb-experiment.app-preview"
);

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

export interface AppPlaygroundProps {
  source?: string;
  extraLibs?: ExtraLib[];
}

/**
 * 构件 `vb-experiment.app-playground`
 */
export
@defineElement("vb-experiment.app-playground", {
  // Monaco editor does not work well with shadow DOM
  shadowOptions: false,
})
class AppPlayground extends ReactNextElement implements AppPlaygroundProps {
  /** 仅初始有效 */
  @property({ attribute: false })
  accessor source: string | undefined;

  @property({ attribute: false })
  accessor extraLibs: ExtraLib[] | undefined;

  @event({ type: "change" })
  accessor #change!: EventEmitter<string>;

  #handleChange = (value: string) => {
    this.#change?.emit(value);
  };

  render() {
    return (
      <AppPlaygroundComponent
        source={this.source}
        extraLibs={this.extraLibs}
        onChange={this.#handleChange}
      />
    );
  }
}

interface AppPlaygroundComponentProps extends AppPlaygroundProps {
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

function AppPlaygroundComponent({
  source,
  extraLibs,
  onChange,
}: AppPlaygroundComponentProps) {
  const [code, setCode] = useState(source ?? "");
  const deferredCode = useDeferredValue(code);
  const [markers, setMarkers] = useState<ExtraMarker[] | undefined>();
  const [app, setApp] = useState<ParsedApp | undefined>();

  const allLibs = useMemo(
    () => [...BUILTIN_LIBS, ...(extraLibs ?? [])],
    [extraLibs]
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
      const result = await worker.parseApp([
        {
          filePath: "/index.tsx",
          content: deferredCode,
        },
      ]);
      if (ignore) {
        return;
      }
      setApp(result);
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

  // const [loading, setLoading] = useState(true);

  const [storyboard, setStoryboard] = useState<Storyboard | undefined>();

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!app) {
        return;
      }
      // setLoading(true);
      let convertedApp: ConvertedApp | undefined;
      try {
        convertedApp = await convertApp(app, { rootId, expanded: true });
        if (ignore) {
          return;
        }
        const storyboard = {
          routes: convertedApp.routes,
          meta: {
            functions: convertedApp.functions,
            customTemplates: convertedApp.templates,
          },
        } as Partial<Storyboard> as Storyboard;
        setStoryboard(storyboard);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to render app:", error);
      }
      // if (!ignore) {
      //   setLoading(false);
      // }
    })();

    return () => {
      ignore = true;
    };
  }, [rootId, app]);

  return (
    <div className={styles.container}>
      <div className={styles.editor}>
        <Suspense fallback="Loading...">
          <AsyncWrappedCodeEditor
            value={source}
            onCodeChange={handleCodeChange}
            language="typescript"
            uri="file:///index.tsx"
            automaticLayout="fit-container"
            theme="tm-vs-dark"
            extraLibs={allLibs}
            extraMarkers={markers}
            data-override-theme="dark-v2"
          />
        </Suspense>
      </div>
      <div className={styles.preview}>
        <WrappedAppPreview storyboard={storyboard} />
      </div>
    </div>
  );
}
