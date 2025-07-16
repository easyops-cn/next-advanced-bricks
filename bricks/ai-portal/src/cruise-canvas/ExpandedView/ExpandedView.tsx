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
import type { GraphGeneratedView } from "../interfaces";
import styles from "./ExpandedView.module.css";
import { CanvasContext } from "../CanvasContext";
import { convertView } from "../utils/converters/convertView";
import { WrappedIcon } from "../bricks";
import { createPortal } from "../utils/createPortal";

export interface ExpandedViewProps {
  views: GraphGeneratedView[];
}

export function ExpandedView({ views }: ExpandedViewProps) {
  const rootId = useMemo(() => uniqueId(), []);
  const { activeExpandedViewJobId, setActiveExpandedViewJobId } =
    useContext(CanvasContext);
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);
  const view = views.find((v) => v.id === activeExpandedViewJobId)?.view;

  const sizeSmall = useMemo(() => {
    let hasForm = false;
    for (const component of view?.components ?? []) {
      if (!component.parentComponentId) {
        switch (component.componentName) {
          case "form":
          case "button":
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
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const convertedView = await convertView(view, {
          rootId,
          expanded: true,
        });
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

  const handleClose = useCallback(() => {
    setActiveExpandedViewJobId(null);
  }, [setActiveExpandedViewJobId]);

  useEffect(() => {
    setTimeout(() => {
      viewportRef.current?.focus();
    }, 0);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        handleClose();
      }
    };
    viewport.addEventListener("keydown", handleKeyDown);
    return () => {
      viewport.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

  return (
    <>
      <div className={styles["expanded-view"]} tabIndex={-1} ref={viewportRef}>
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
      </div>
      <ul className={styles.nav}>
        {views.map((view) => (
          <li key={view.id}>
            <button
              className={classNames(styles["nav-button"], {
                [styles.active]: activeExpandedViewJobId === view.id,
              })}
            >
              {view.view.title}
            </button>
          </li>
        ))}
      </ul>
      <button className={styles.close} onClick={handleClose}>
        <WrappedIcon lib="antd" icon="close" />
      </button>
    </>
  );
}
