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
import styles from "./CreatedView.module.css";
import sharedStyles from "../../cruise-canvas/shared.module.css";
import type { Job } from "../../cruise-canvas/interfaces";
import { convertView } from "../../cruise-canvas/utils/converters/convertView";
import { WrappedIcon } from "../../shared/bricks";
import { K, locales, NS, t } from "./i18n";
import { createPortal } from "../../cruise-canvas/utils/createPortal";
import { convertJsx } from "../../cruise-canvas/utils/jsx-converters/convertJsx";
import { isJsxView } from "../../cruise-canvas/utils/jsx-converters/isJsxView";
import { TaskContext } from "../TaskContext";

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
  const { setActiveExpandedViewJobId } = useContext(TaskContext);
  const ref = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);
  const view = job.generatedView!;

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
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const convertedView = await (isJsxView(view)
          ? convertJsx(view, { rootId })
          : convertView(view, { rootId }));
        if (ignore) {
          return;
        }
        await rootRef.current?.render(convertedView ?? []);
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
  }, [rootId, view]);

  const sizeLarge = useMemo(() => {
    if (isJsxView(view)) {
      // TODO: handle nested components
      for (const component of view.components ?? []) {
        if (component.name === "table") {
          return true;
        }
        if (component.name === "dashboard") {
          const widgets = component?.properties?.widgets;
          if (
            Array.isArray(widgets) &&
            widgets.length >= (component.properties!.groupField ? 3 : 7)
          ) {
            return true;
          }
        }
      }
    } else {
      for (const component of view.components ?? []) {
        if (component.componentName === "table") {
          return true;
        }
        if (component.componentName === "dashboard") {
          const widgets = component?.properties?.widgets;
          if (
            Array.isArray(widgets) &&
            widgets.length >= (component.properties!.groupField ? 3 : 7)
          ) {
            return true;
          }
        }
      }
    }
    return false;
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
            [sharedStyles["shine-text"]]: loading,
          })}
        >
          {view.title}
        </div>
        <button
          className={styles.expand}
          title={t(K.FULLSCREEN)}
          onClick={handleExpandClick}
        >
          <WrappedIcon lib="easyops" icon="expand" />
        </button>
      </div>
      <div data-root-id={rootId} ref={ref} />
    </div>
  );
}
