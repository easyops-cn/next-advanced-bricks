import React, { Suspense, useContext, useMemo, useState } from "react";
import { asyncWrapBrick } from "@next-core/react-runtime";
import type { CodeEditor, CodeEditorProps } from "@next-bricks/vs/code-editor";
import nextTsxDefinition from "@next-shared/tsx-parser/lib/next-tsx.d.ts?raw";
import componentsDefinition from "@next-shared/tsx-converter/lib/components.d.ts?raw";
import styles from "./JsxEditor.module.css";
import { WrappedButton, WrappedIconButton } from "../bricks";
import { ICON_CLOSE } from "../constants";
import { TaskContext } from "../TaskContext";
import { getAsyncConstructedView } from "../getAsyncConstructedView";

interface CodeEditorEvents {
  "code.change": CustomEvent<string>;
}

interface CodeEditorMapEvents {
  onCodeChange: "code.change";
}

const editorLibs: CodeEditorProps["extraLibs"] = [
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
  {
    filePath: "/node_modules/next-tsx/contracts.d.ts",
    content: `type ContractMap = Record<string, any>;`,
  },
];

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

export function JsxEditor() {
  const {
    workspace,
    manuallyUpdatedViews,
    updateView,
    activeJsxEditorJob,
    setActiveJsxEditorJob,
    viewLibs,
  } = useContext(TaskContext);
  const view =
    manuallyUpdatedViews?.get(activeJsxEditorJob!.id) ??
    activeJsxEditorJob!.generatedView!;
  const source = view.code;
  const [code, setCode] = useState(source);

  const libs = useMemo(() => {
    const commonLibs = editorLibs!;
    if (view.withContexts?.RESPONSE) {
      return [
        ...commonLibs,
        {
          filePath: "tsx-view/response.d.ts",
          content: `const RESPONSE_VALUE = ${JSON.stringify(view.withContexts.RESPONSE, null, 2)};

declare const RESPONSE: typeof RESPONSE_VALUE;`,
        },
        ...(viewLibs ?? []),
      ];
    }
    return commonLibs;
  }, [view.withContexts?.RESPONSE, viewLibs]);

  return (
    <div className={styles.container}>
      <div className={styles.editor}>
        <div className={styles.header}>
          <span className={styles.title}>JSX Editor</span>
          <WrappedIconButton
            icon={ICON_CLOSE}
            onClick={() => {
              setActiveJsxEditorJob?.(undefined);
            }}
          />
        </div>
        <div className={styles.body}>
          <div className={styles.content}>
            <Suspense fallback="Loading...">
              <AsyncWrappedCodeEditor
                value={source}
                onCodeChange={(e) => {
                  setCode(e.detail);
                }}
                language="typescript"
                uri="file:///view.tsx"
                automaticLayout="fit-container"
                theme="tm-vs-dark"
                extraLibs={libs}
                data-override-theme="dark-v2"
              />
            </Suspense>
          </div>
        </div>
        <div className={styles.footer}>
          <WrappedButton
            themeVariant="elevo"
            type="primary"
            onClick={() => {
              const newView = {
                ...view,
                code,
              };
              newView.asyncConstructedView = getAsyncConstructedView(
                newView,
                workspace,
                viewLibs
              );
              updateView?.(activeJsxEditorJob!.id, newView);
              setActiveJsxEditorJob?.(undefined);
            }}
          >
            Save
          </WrappedButton>
        </div>
      </div>
    </div>
  );
}
