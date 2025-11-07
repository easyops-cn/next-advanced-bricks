import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "classnames";
import { getBasePath, unstable_createRoot } from "@next-core/runtime";
import { uniqueId } from "lodash";
import { convertView } from "@next-tsx/converter";
import type { GraphGeneratedView } from "../../cruise-canvas/interfaces";
import styles from "./ExpandedView.module.css";
import { WrappedIcon, WrappedIconButton } from "../../shared/bricks";
import { createPortal } from "../../cruise-canvas/utils/createPortal";
import { ICON_CLOSE, ICON_EXTERNAL_LINK, ICON_FEEDBACK } from "../constants";
import { TaskContext } from "../TaskContext";
import { useViewFeedbackDone } from "../useViewFeedbackDone";
import { parseTemplate } from "../parseTemplate";
import type { ParsedView } from "../interfaces";
import type { ModulePartOfComponent } from "@next-tsx/parser";

export interface ExpandedViewProps {
  views: GraphGeneratedView[];
}

export function ExpandedView({ views }: ExpandedViewProps) {
  const rootId = useMemo(() => uniqueId(), []);
  const {
    workspace,
    previewUrlTemplate,
    activeExpandedViewJobId,
    setActiveExpandedViewJobId,
    manuallyUpdatedViews,
    showFeedbackOnView,
    onFeedbackOnView,
    feedbackDoneViews,
  } = useContext(TaskContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);
  const generatedView = activeExpandedViewJobId
    ? (manuallyUpdatedViews?.get(activeExpandedViewJobId) ??
      views.find((v) => v.id === activeExpandedViewJobId)?.view)
    : null;
  const feedbackDone =
    useViewFeedbackDone(generatedView?.viewId, showFeedbackOnView) ||
    (generatedView && feedbackDoneViews?.has(generatedView.viewId));
  const [view, setView] = useState<ParsedView | null>(null);
  const canFeedback =
    !!view && !!generatedView?.viewId && generatedView.from !== "config";
  const [viewsWithTitle, setViewsWithTitle] = useState<
    Array<
      GraphGeneratedView & {
        title?: string;
      }
    >
  >(views);

  useEffect(() => {
    setView(null);
    let ignore = false;
    generatedView?.asyncConstructedView?.then((view) => {
      if (!ignore) {
        setView(view);
      }
    });
    return () => {
      ignore = true;
    };
  }, [generatedView]);

  useEffect(() => {
    Promise.all(
      views.map(async (v) => {
        const view = await v.view.asyncConstructedView;
        return {
          ...v,
          title: (view?.entry?.defaultExport as ModulePartOfComponent)?.title,
        };
      })
    ).then((result) => {
      setViewsWithTitle(result);
    });
  }, [views]);

  useEffect(() => {
    const container = containerRef.current;
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
        const convertedView = await convertView(view, {
          rootId,
          workspace,
          expanded: true,
          withContexts: view.withContexts,
        });
        if (ignore) {
          return;
        }
        const { brick, context, functions, templates } = convertedView;
        await rootRef.current?.render(brick, { context, functions, templates });
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

  const handleClose = useCallback(() => {
    setActiveExpandedViewJobId(null);
  }, [setActiveExpandedViewJobId]);

  return (
    <div className={styles["expanded-view"]}>
      {loading && (
        <div className={styles.loading}>
          <WrappedIcon lib="antd" icon="loading-3-quarters" spinning />
        </div>
      )}
      <div
        className={classNames(styles.body, {
          // [styles.small]: sizeSmall,
        })}
        ref={containerRef}
        data-root-id={rootId}
      />
      <ul className={styles.nav}>
        {viewsWithTitle.map((view) => (
          <li key={view.id}>
            <button
              className={classNames(styles["nav-button"], {
                [styles.active]: activeExpandedViewJobId === view.id,
              })}
              onClick={() => setActiveExpandedViewJobId(view.id)}
            >
              {view.title ?? "…"}
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.buttons}>
        {showFeedbackOnView && !feedbackDone && canFeedback && (
          <WrappedIconButton
            icon={ICON_FEEDBACK}
            onClick={() => onFeedbackOnView?.(generatedView.viewId)}
          />
        )}
        {!!(
          generatedView?.viewId &&
          !generatedView.withContexts &&
          previewUrlTemplate
        ) && (
          <WrappedIconButton
            icon={ICON_EXTERNAL_LINK}
            onClick={() => {
              window.open(
                `${getBasePath().slice(0, -1)}${parseTemplate(
                  previewUrlTemplate,
                  {
                    viewId: generatedView.viewId,
                  }
                )}`,
                "_blank"
              );
            }}
          />
        )}
        <WrappedIconButton icon={ICON_CLOSE} onClick={handleClose} />
      </div>
    </div>
  );
}
