import React, { Suspense, use, useEffect, useMemo, useRef } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { unstable_createRoot } from "@next-core/runtime";
import type { ModulePartOfComponent, ParsedApp } from "@next-shared/tsx-parser";
import { convertView, type ConvertResult } from "@next-shared/tsx-converter";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type {
  EoPageTitle,
  PageTitleProps,
} from "@next-bricks/basic/page-title";
import type {
  EoMainView,
  MainViewProps,
} from "@next-bricks/containers/main-view";
import type {
  EoNarrowView,
  NarrowViewProps,
} from "@next-bricks/containers/narrow-view";
import { uniqueId } from "lodash";
import { K, NS, locales, t } from "./i18n.js";
import styles from "./styles.module.css";
import { getRemoteTsxParserWorker } from "../shared/workers/tsxParser.js";
import { createPortal } from "../cruise-canvas/utils/createPortal.js";

initializeI18n(NS, locales);

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedPageTitle = wrapBrick<EoPageTitle, PageTitleProps>(
  "eo-page-title"
);
const WrappedMainView = wrapBrick<EoMainView, MainViewProps>("eo-main-view");
const WrappedNarrowView = wrapBrick<EoNarrowView, NarrowViewProps>(
  "eo-narrow-view"
);

const { defineElement, property } = createDecorators();

export interface PreviewContainerProps {
  source?: string;
  url?: string;
}

/**
 * 构件 `ai-portal.preview-container`
 */
export
@defineElement("ai-portal.preview-container", {
  shadowOptions: false,
})
class PreviewContainer
  extends ReactNextElement
  implements PreviewContainerProps
{
  @property({ attribute: false })
  accessor source: string | undefined;

  @property()
  accessor url: string | undefined;

  #rootId = uniqueId();

  render() {
    return (
      <Suspense
        fallback={
          <WrappedIcon
            lib="antd"
            icon="loading-3-quarters"
            spinning
            className={styles.loading}
          />
        }
      >
        <PreviewContainerComponent
          rootId={this.#rootId}
          source={this.source}
          url={this.url}
        />
      </Suspense>
    );
  }
}

interface PreviewContainerComponentProps extends PreviewContainerProps {
  rootId: string;
}

function PreviewContainerComponent({
  rootId,
  source,
  url,
}: PreviewContainerComponentProps) {
  const parsedResultPromise = useMemo(() => {
    if (!source) {
      return Promise.resolve(null);
    }
    return parse(source).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to parse view:", error);
      return null;
    });
  }, [source]);

  const parsedResult = use(parsedResultPromise);

  const convertedResultPromise = useMemo(() => {
    if (!parsedResult) {
      return Promise.resolve(null);
    }
    return convertView(parsedResult, {
      rootId,
      expanded: true,
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to convert view:", error);
      return null;
    });
  }, [parsedResult, rootId]);

  const convertedResult = use(convertedResultPromise);

  const viewTitle = useMemo(
    () => (parsedResult?.entry?.defaultExport as ModulePartOfComponent)?.title,
    [parsedResult]
  );

  return (
    <RenderComponent
      rootId={rootId}
      pageTitle={viewTitle}
      convertedResult={convertedResult}
      url={url}
    />
  );
}

interface RenderComponentProps {
  rootId: string;
  pageTitle?: string;
  convertedResult: ConvertResult | null;
  url?: string;
}

function RenderComponent({
  rootId,
  pageTitle,
  convertedResult,
  url,
}: RenderComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);

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

  useEffect(() => {
    if (!convertedResult) {
      return;
    }
    const { brick, context, functions, templates } = convertedResult;
    rootRef.current?.render(brick, { context, functions, templates, url });
  }, [convertedResult, url]);

  return (
    <WrappedNarrowView size="large" className={styles.container}>
      <WrappedMainView>
        <WrappedPageTitle
          slot="pageTitle"
          pageTitle={pageTitle || t(K.UNTITLED)}
        />
        <div className={styles.main} ref={containerRef} data-root-id={rootId} />
      </WrappedMainView>
    </WrappedNarrowView>
  );
}

async function parse(source: string): Promise<ParsedApp> {
  const worker = await getRemoteTsxParserWorker();
  const result = await worker.parseView(source);
  return result;
}
