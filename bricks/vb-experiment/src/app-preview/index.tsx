import React, { useCallback, useEffect, useRef, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { __secret_internals, getBasePath } from "@next-core/runtime";
import type { BootstrapData, MicroApp, Storyboard } from "@next-core/types";
import "@next-core/theme";
import styleText from "./styles.shadow.css";

const { defineElement, property } = createDecorators();

export interface AppPreviewProps {
  storyboard?: Storyboard;
}

/**
 * 构件 `vb-experiment.app-preview`
 */
export
@defineElement("vb-experiment.app-preview", {
  styleTexts: [styleText],
})
class AppPreview extends ReactNextElement {
  @property({ attribute: false })
  accessor storyboard: Storyboard | undefined;

  render() {
    return <AppPreviewComponent storyboard={this.storyboard} />;
  }
}

interface PreviewWindow extends Window {
  _preview_only_setupAppPreview?(
    data: BootstrapData,
    url: string
  ): Promise<void>;
  _preview_only_updateApp?(
    appId: string,
    storyboard: Partial<Storyboard>
  ): void;
  _preview_only_reload?(): void;
}

function AppPreviewComponent({ storyboard }: AppPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  const handleIframeLoad = useCallback(() => {
    const check = () => {
      const iframeWin = iframeRef.current?.contentWindow as PreviewWindow;
      if (iframeWin?._preview_only_setupAppPreview) {
        setReady(true);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }, []);

  const setupRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!ready || !storyboard) {
      return;
    }
    const iframe = iframeRef.current!.contentWindow as PreviewWindow;

    const app: MicroApp = {
      id: "lab-app-preview",
      name: "Lab: App Preview",
      homepage: "/lab-app-preview",
    };

    if (setupRef.current) {
      let ignore = false;
      setupRef.current.then(() => {
        if (ignore) {
          return;
        }
        iframe._preview_only_updateApp?.(app.id, { ...storyboard, app });
        iframe._preview_only_reload?.();
      });
      return () => {
        ignore = true;
      };
    } else {
      setupRef.current = iframe._preview_only_setupAppPreview!(
        {
          brickPackages: (__secret_internals as any).getBrickPackages(),
          storyboards: [
            {
              ...storyboard,
              app,
            },
          ],
        },
        app.homepage
      );
    }
  }, [ready, storyboard]);

  return (
    <div className="container">
      <iframe
        ref={iframeRef}
        src={`${getBasePath()}lab/?_experimental_app_preview_=1`}
        loading="lazy"
        onLoad={handleIframeLoad}
      />
    </div>
  );
}
