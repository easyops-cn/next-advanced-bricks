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
import type { GraphGeneratedView } from "../../cruise-canvas/interfaces";
import styles from "./ExpandedView.module.css";
import { convertView } from "../../cruise-canvas/utils/converters/convertView";
import { WrappedIcon, WrappedIconButton } from "../../shared/bricks";
import { createPortal } from "../../cruise-canvas/utils/createPortal";
import { ICON_CLOSE } from "../constants";
import { isJsxView } from "../../cruise-canvas/utils/jsx-converters/isJsxView";
import { convertJsx } from "../../cruise-canvas/utils/jsx-converters/convertJsx";
import { TaskContext } from "../TaskContext";

export interface ExpandedViewProps {
  views: GraphGeneratedView[];
}

export function ExpandedView({ views }: ExpandedViewProps) {
  const rootId = useMemo(() => uniqueId(), []);
  const { activeExpandedViewJobId, setActiveExpandedViewJobId } =
    useContext(TaskContext);
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);
  const view = views.find((v) => v.id === activeExpandedViewJobId)?.view;

  const sizeSmall = useMemo(() => {
    let hasForm = false;
    if (view && isJsxView(view)) {
      for (const component of view?.components ?? []) {
        switch (component.name) {
          case "form":
          case "button":
            hasForm = true;
            break;
          default:
            return false;
        }
      }
    } else {
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
        const convertedView = view
          ? await (isJsxView(view)
              ? convertJsx(view, { rootId, expanded: true })
              : convertView(view, { rootId, expanded: true }))
          : null;
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
      <WrappedIconButton
        icon={ICON_CLOSE}
        className={styles.close}
        onClick={handleClose}
      />
    </div>
  );
}
