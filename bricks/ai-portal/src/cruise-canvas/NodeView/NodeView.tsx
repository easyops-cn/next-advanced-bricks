// istanbul ignore file: experimental
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  // useState,
} from "react";
import { unstable_createRoot } from "@next-core/runtime";
import classNames from "classnames";
import { uniqueId } from "lodash";
import styles from "./NodeView.module.css";
import jobStyles from "../NodeJob/NodeJob.module.css";
import sharedStyles from "../shared.module.css";
// import sharedStyles from "../shared.module.css";
import type { Job } from "../interfaces";
// import type { ViewWithInfo } from "../utils/converters/interfaces";
import { convertView } from "../utils/converters/convertView";
import { CanvasContext } from "../CanvasContext";
import { WrappedIcon } from "../bricks";
import { t } from "../i18n";
import { createPortal } from "../utils/createPortal";

export interface NodeViewProps {
  job: Job;
  active?: boolean;
}

export function NodeView({ job, active }: NodeViewProps): JSX.Element {
  const rootId = useMemo(() => uniqueId(), []);
  const { setHoverOnScrollableContent, setActiveExpandedViewJobId } =
    useContext(CanvasContext);
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
        const convertedView = await convertView(view, { rootId });
        if (ignore) {
          return;
        }
        await rootRef.current?.render(convertedView ?? []);
        if (ignore) {
          return;
        }
      } catch {
        // eslint-disable-next-line no-console
        console.error("Failed to render view:", view);
      }
      setLoading(false);
    })();

    return () => {
      ignore = true;
    };
  }, [rootId, view]);

  const sizeLarge = useMemo(() => {
    for (const component of view.components ?? []) {
      if (component.componentName === "table") {
        return true;
      }
      if (component.componentName === "dashboard") {
        const widgets = component?.properties?.widgets;
        if (Array.isArray(widgets) && widgets.length >= 7) {
          return true;
        }
      }
    }
    return false;
  }, [view]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      let found = false;
      for (const el of e.nativeEvent.composedPath()) {
        if (el === ref.current) {
          break;
        }
        if (
          el instanceof HTMLElement &&
          el.classList.contains("ant-table") &&
          el.classList.contains("ant-table-scroll-horizontal")
        ) {
          found = true;
          break;
        }
      }
      setHoverOnScrollableContent(found);
    },
    [setHoverOnScrollableContent]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverOnScrollableContent(false);
  }, [setHoverOnScrollableContent]);

  const handleExpandClick = useCallback(() => {
    setActiveExpandedViewJobId(job.id);
  }, [job.id, setActiveExpandedViewJobId]);

  return (
    <div
      className={classNames(jobStyles["node-job"], {
        [jobStyles.active]: active,
        [jobStyles.large]: sizeLarge,
      })}
    >
      <div className={jobStyles.background} />
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
          title={t("FULLSCREEN")}
          onClick={handleExpandClick}
        >
          <WrappedIcon lib="easyops" icon="fullscreen" />
        </button>
      </div>
      <div
        data-root-id={rootId}
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
