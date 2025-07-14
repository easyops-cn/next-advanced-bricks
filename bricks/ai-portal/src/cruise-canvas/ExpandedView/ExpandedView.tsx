import React, { useCallback, useContext, useEffect, useRef } from "react";
import classNames from "classnames";
import { unstable_createRoot } from "@next-core/runtime";
import type { GraphGeneratedView } from "../interfaces";
import styles from "./ExpandedView.module.css";
import { CanvasContext } from "../CanvasContext";
import { convertView } from "../utils/converters/convertView";
import { WrappedIcon } from "../bricks";

export interface ExpandedViewProps {
  views: GraphGeneratedView[];
}

export function ExpandedView({ views }: ExpandedViewProps) {
  const { activeExpandedViewJobId, setActiveExpandedViewJobId } =
    useContext(CanvasContext);
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);
  const view = views.find((v) => v.id === activeExpandedViewJobId)?.view;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const root = unstable_createRoot(container, {
      supportsUseChildren: true,
    } as any);
    rootRef.current = root;

    return () => {
      root.unmount();
      rootRef.current = null;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const convertedView = await convertView(view, { expanded: true });
      if (ignore) {
        return;
      }
      rootRef.current?.render(convertedView ?? []);
    })();

    return () => {
      ignore = true;
    };
  }, [view]);

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
    <div className={styles["expanded-view"]} tabIndex={-1} ref={viewportRef}>
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
      <div className={styles.body} ref={containerRef} />
      <button className={styles.close} onClick={handleClose}>
        <WrappedIcon lib="antd" icon="close" />
      </button>
    </div>
  );
}
