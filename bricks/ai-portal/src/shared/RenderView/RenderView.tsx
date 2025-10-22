import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { uniqueId } from "lodash";
import type { ParsedView } from "../interfaces";
import { getAsyncConstructedView } from "../getAsyncConstructedView";
import { createPortal } from "../../cruise-canvas/utils/createPortal";
import { unstable_createRoot } from "@next-core/runtime";
import { convertView } from "@next-shared/tsx-converter";
import { TaskContext } from "../TaskContext";

export interface RenderViewProps {
  value: string;
}

export function RenderView({ value }: RenderViewProps) {
  const { viewLibs } = useContext(TaskContext);
  const rootId = useMemo(() => uniqueId(), []);
  const ref = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);
  const [view, setView] = useState<ParsedView | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const parsedView = await getAsyncConstructedView(
        { code: value },
        undefined,
        viewLibs
      );
      if (!ignore) {
        setView(parsedView);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [value, viewLibs]);

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

  // const [loading, setLoading] = useState(true);
  // const [sizeLarge, setSizeLarge] = useState(false);

  useEffect(() => {
    // setLoading(true);
    if (!view) {
      return;
    }
    let ignore = false;
    (async () => {
      try {
        const convertedView = await convertView(view, {
          rootId,
          // workspace,
          withContexts: view.withContexts,
          // withoutWrapper: true,
          allowAnyBricks: true,
        });
        if (ignore) {
          return;
        }
        const { brick, context, functions, templates } = convertedView;

        // setSizeLarge(preferSizeLarge(brick));

        await rootRef.current?.render(brick, { context, functions, templates });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to render view:", error);
      }
      // if (!ignore) {
      //   setLoading(false);
      // }
    })();

    return () => {
      ignore = true;
    };
  }, [rootId, /* workspace, */ view]);

  return <div data-root-id={rootId} ref={ref} />;
}
