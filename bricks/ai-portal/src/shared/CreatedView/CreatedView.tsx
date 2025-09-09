// istanbul ignore file: experimental
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { unstable_createRoot } from "@next-core/runtime";
import classNames from "classnames";
import { uniqueId } from "lodash";
import { initializeI18n } from "@next-core/i18n";
import {
  convertJsx,
  parseTsx,
  type Component,
  type ConstructedView,
} from "@next-shared/jsx-storyboard";
import styles from "./CreatedView.module.css";
import sharedStyles from "../../cruise-canvas/shared.module.css";
import type { Job } from "../../cruise-canvas/interfaces";
import { WrappedIcon } from "../../shared/bricks";
import { K, locales, NS, t } from "./i18n";
import { createPortal } from "../../cruise-canvas/utils/createPortal";
import { TaskContext } from "../TaskContext";
import { ICON_FEEDBACK, ICON_LOADING } from "../constants";
import { useViewFeedbackDone } from "../useViewFeedbackDone";

initializeI18n(NS, locales);

export interface CreatedViewProps {
  job: Job;
  onSizeChange?: (size: "medium" | "large") => void;
}

export function CreatedView({
  job,
  onSizeChange,
}: CreatedViewProps): JSX.Element {
  const rootId = useMemo(() => uniqueId(), []);
  const {
    workspace,
    showJsxEditor,
    setActiveExpandedViewJobId,
    setActiveJsxEditorJob,
    manuallyUpdatedViews,
    showFeedbackOnView,
    onFeedbackOnView,
    feedbackDoneViews,
  } = useContext(TaskContext);
  const ref = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);
  const generatedView = manuallyUpdatedViews?.get(job.id) ?? job.generatedView!;
  const feedbackDone =
    useViewFeedbackDone(generatedView.viewId, showFeedbackOnView) ||
    feedbackDoneViews?.has(generatedView.viewId);
  const [view, setView] = useState<ConstructedView | null>(null);
  const canFeedback =
    !!view && !!generatedView.viewId && generatedView.from !== "config";

  useEffect(() => {
    (async () => {
      try {
        const result = parseTsx(generatedView.code, {
          workspace,
          withContexts: generatedView.withContexts
            ? Object.keys(generatedView.withContexts)
            : undefined,
        });
        setView({
          ...result,
          viewId: generatedView.viewId,
          from: generatedView.from,
          withContexts: generatedView.withContexts,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse generated view:", error);
      }
    })();
  }, [generatedView, workspace]);

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!view) {
      return;
    }
    let ignore = false;
    (async () => {
      try {
        const convertedView = await convertJsx(view, { rootId, workspace });
        if (ignore) {
          return;
        }
        const { brick, context } = convertedView;
        await rootRef.current?.render(brick, { context });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to render view:", error);
      }
      if (!ignore) {
        setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [rootId, workspace, view]);

  const sizeLarge = useMemo(() => {
    let large = false;
    traverseComponents(view?.components ?? [], (component) => {
      if (large) {
        return;
      }
      if (component.name === "Table" || component.name === "eo-table") {
        large = true;
      } else if (
        component.name === "Dashboard" ||
        component.name === "eo-dashboard"
      ) {
        const widgets = component?.properties?.widgets;
        if (
          Array.isArray(widgets) &&
          widgets.length >= (component.properties!.groupField ? 3 : 7)
        ) {
          large = true;
        }
      }
    });
    return large;
  }, [view]);

  useEffect(() => {
    onSizeChange?.(sizeLarge ? "large" : "medium");
  }, [onSizeChange, sizeLarge]);

  const handleExpandClick = useCallback(() => {
    setActiveExpandedViewJobId(job.id);
  }, [job.id, setActiveExpandedViewJobId]);

  return (
    <div>
      <div className={styles.heading}>
        <div
          className={classNames(styles.title, {
            [sharedStyles["shine-text"]]: view && loading,
          })}
        >
          {view ? view.title : <WrappedIcon {...ICON_LOADING} />}
        </div>
        <div className={styles.buttons}>
          {showJsxEditor && (
            <button
              className={styles.button}
              onClick={() => {
                setActiveJsxEditorJob?.(job);
              }}
            >
              <WrappedIcon lib="antd" icon="bug" />
            </button>
          )}
          {showFeedbackOnView && !feedbackDone && canFeedback && (
            <button
              className={styles.button}
              title={t(K.FEEDBACK)}
              onClick={() => onFeedbackOnView?.(generatedView.viewId)}
            >
              <WrappedIcon {...ICON_FEEDBACK} />
            </button>
          )}
          <button
            className={styles.button}
            title={t(K.FULLSCREEN)}
            onClick={handleExpandClick}
          >
            <WrappedIcon lib="easyops" icon="expand" />
          </button>
        </div>
      </div>
      <div data-root-id={rootId} ref={ref} />
    </div>
  );
}

function traverseComponents(
  components: Component[],
  callback: (component: Component) => void
) {
  for (const component of components) {
    callback(component);
    traverseComponents(component.children ?? [], callback);
  }
}
