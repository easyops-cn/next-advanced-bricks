import React, { Suspense, useContext, useState } from "react";
import { asyncWrapBrick } from "@next-core/react-runtime";
import type { CodeEditor, CodeEditorProps } from "@next-bricks/vs/code-editor";
import { parseJsx, parseTsx } from "@next-shared/jsx-storyboard";
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
