import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "classnames";
import { unstable_createRoot } from "@next-core/runtime";
import { uniqueId } from "lodash";
import { convertTsx } from "@next-shared/tsx-converter";
import type { ParseResult } from "@next-shared/tsx-parser";
import type { GraphGeneratedView } from "../../cruise-canvas/interfaces";
import styles from "./ExpandedView.module.css";
import { WrappedIcon, WrappedIconButton } from "../../shared/bricks";
import { createPortal } from "../../cruise-canvas/utils/createPortal";
import { ICON_CLOSE, ICON_FEEDBACK } from "../constants";
import { TaskContext } from "../TaskContext";
import { useViewFeedbackDone } from "../useViewFeedbackDone";

export interface ExpandedViewProps {
  views: GraphGeneratedView[];
}

export function ExpandedView({ views }: ExpandedViewProps) {
  const rootId = useMemo(() => uniqueId(), []);
  const {
    workspace,
    activeExpandedViewJobId,
    setActiveExpandedViewJobId,
    manuallyUpdatedViews,
    showFeedbackOnView,
    onFeedbackOnView,
    feedbackDoneViews,
  } = useContext(TaskContext);
  const viewportRef = useRef<HTMLDivElement>(null);
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
  const [view, setView] = useState<ParseResult | null>(null);
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
    generatedView?.asyncConstructedView?.then((view) => {
      setView(view);
    });
  }, [generatedView, workspace]);

  useEffect(() => {
    Promise.all(
      views.map(async (v) => {
        const view = await v.view.asyncConstructedView;
        return {
          ...v,
          title: view?.title,
        };
      })
    ).then((result) => {
      setViewsWithTitle(result);
    });
  }, [views]);

  const sizeSmall = useMemo(() => {
    let hasForm = false;
    if (view) {
      for (const component of view?.components ?? []) {
        switch (component.name) {
          case "Form":
          case "eo-form":
          case "Button":
          case "eo-button":
            hasForm = true;
            break;
          default:
            return false;
        }
      }
    }
    return hasForm;
  }, [view]);

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
    if (!view || !generatedView) {
      return;
    }
    let ignore = false;
    (async () => {
      try {
        const convertedView = await convertTsx(view, {
          rootId,
          workspace,
          expanded: true,
          withContexts: generatedView.withContexts,
        });
        if (ignore) {
          return;
        }
        const { brick, context, functions } = convertedView;
        await rootRef.current?.render(brick, { context, functions });
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
  }, [rootId, workspace, view, generatedView]);

  const handleClose = useCallback(() => {
    setActiveExpandedViewJobId(null);
  }, [setActiveExpandedViewJobId]);

  useEffect(() => {
    setTimeout(() => {
      viewportRef.current?.focus();
    }, 0);
  }, []);

  const handleKeydown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        handleClose();
      }
    },
    [handleClose]
  );

  return (
    <div
      className={styles["expanded-view"]}
      tabIndex={-1}
      ref={viewportRef}
      onKeyDown={handleKeydown}
    >
      {loading && (
        <div className={styles.loading}>
          <WrappedIcon lib="antd" icon="loading-3-quarters" spinning />
        </div>
      )}
      <div
        className={classNames(styles.body, {
          [styles.small]: sizeSmall,
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
        <WrappedIconButton icon={ICON_CLOSE} onClick={handleClose} />
      </div>
    </div>
  );
}
