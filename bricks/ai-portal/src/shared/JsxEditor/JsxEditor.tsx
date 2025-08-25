import React, { Suspense, useContext, useMemo, useState } from "react";
import { asyncWrapBrick } from "@next-core/react-runtime";
import type { CodeEditor, CodeEditorProps } from "@next-bricks/vs/code-editor";
import { parseJsx, parseTsx } from "@next-shared/jsx-storyboard";
import actionsDefinition from "@next-shared/jsx-storyboard/lib/actions.d.ts?raw";
import componentsDefinition from "@next-shared/jsx-storyboard/lib/components.d.ts?raw";
import styles from "./JsxEditor.module.css";
import { WrappedButton, WrappedIconButton } from "../bricks";
import { ICON_CLOSE } from "../constants";
import { TaskContext } from "../TaskContext";
import type { ConstructedView } from "../../cruise-canvas/interfaces";

interface CodeEditorEvents {
  "code.change": CustomEvent<string>;
}

interface CodeEditorMapEvents {
  onCodeChange: "code.change";
}

const editorLibs: CodeEditorProps["extraLibs"] = [
  {
    filePath: "tsx-view/actions.d.ts",
    content: actionsDefinition,
  },
  {
    filePath: "tsx-view/components.d.ts",
    content: componentsDefinition.replaceAll("export interface", "interface"),
  },
  {
    filePath: "tsx-view/contracts.d.ts",
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
    manuallyUpdatedViews,
    updateView,
    activeJsxEditorJob,
    setActiveJsxEditorJob,
  } = useContext(TaskContext);
  const view =
    manuallyUpdatedViews?.get(activeJsxEditorJob!.id) ??
    (activeJsxEditorJob!.generatedView as ConstructedView) ??
    activeJsxEditorJob!.staticDataView!;
  const source = view.source;
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
      ];
    }
    return commonLibs;
  }, [view.withContexts?.RESPONSE]);

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
              updateView?.(activeJsxEditorJob!.id, {
                viewId: view.viewId,
                ...(code.includes("<eo-view") ? parseJsx : parseTsx)(
                  code,
                  view.withContexts
                    ? { withContexts: Object.keys(view.withContexts) }
                    : undefined
                ),
                withContexts: view.withContexts,
              });
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
