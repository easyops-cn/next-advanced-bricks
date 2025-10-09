// istanbul ignore file: experimental
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { unstable_createRoot } from "@next-core/runtime";
import classNames from "classnames";
import { uniqueId } from "lodash";
import { convertTsx, getViewTitle } from "@next-shared/tsx-converter";
import type { Component } from "@next-shared/tsx-parser";
import styles from "./CreatedView.module.css";
import sharedStyles from "../../cruise-canvas/shared.module.css";
import type { Job, ParsedView } from "../../shared/interfaces";
import { WrappedIcon } from "../../shared/bricks";
import { createPortal } from "../../cruise-canvas/utils/createPortal";
import { TaskContext } from "../TaskContext";
import { ICON_LOADING } from "../constants";
import { ViewToolbar } from "./ViewToolbar";

export interface CreatedViewProps {
  job: Job;
  noHeading?: boolean;
  onSizeChange?: (size: "medium" | "large") => void;
}

export function CreatedView({
  job,
  noHeading,
  onSizeChange,
}: CreatedViewProps): JSX.Element {
  const rootId = useMemo(() => uniqueId(), []);
  const { workspace, manuallyUpdatedViews } = useContext(TaskContext);
  const ref = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);
  const generatedView = manuallyUpdatedViews?.get(job.id) ?? job.generatedView!;
  const [view, setView] = useState<ParsedView | null>(null);
  const canFeedback =
    !!view && !!generatedView.viewId && generatedView.from !== "config";

  useEffect(() => {
    setView(null);
    let ignore = false;
    generatedView.asyncConstructedView?.then((view) => {
      if (!ignore) {
        setView(view);
      }
    });
    return () => {
      ignore = true;
    };
  }, [generatedView]);

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
        const convertedView = await convertTsx(view, {
          rootId,
          workspace,
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

  const viewTitle = useMemo(() => getViewTitle(view), [view]);

  return (
    <>
      {noHeading ? null : (
        <div className={styles.heading}>
          <div
            className={classNames(styles.title, {
              [sharedStyles["shine-text"]]: view && loading,
            })}
          >
            {view ? viewTitle : <WrappedIcon {...ICON_LOADING} />}
          </div>
          <ViewToolbar job={job} canFeedback={canFeedback} />
        </div>
      )}
      <div data-root-id={rootId} ref={ref} />
    </>
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
