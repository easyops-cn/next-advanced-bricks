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
  _preview_only_appPreviewer?: AppPreviewer;
}

interface AppPreviewer {
  setup(data: BootstrapData, url: string): Promise<void>;
  update(appId: string, storyboard: Partial<Storyboard>): void;
  reload(): void;
  push(url: string): void;
  replace(url: string): void;
  goBack(): void;
  goForward(): void;
}

function AppPreviewComponent({ storyboard }: AppPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [appPreviewer, setAppPreviewer] = useState<AppPreviewer | null>(null);

  const handleIframeLoad = useCallback(() => {
    const check = () => {
      const previewer = (iframeRef.current?.contentWindow as PreviewWindow)
        ?._preview_only_appPreviewer;
      if (previewer) {
        setAppPreviewer(previewer);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }, []);

  const setupRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!appPreviewer || !storyboard) {
      return;
    }

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
        appPreviewer.update(app.id, { ...storyboard, app });
        appPreviewer.reload();
      });
      return () => {
        ignore = true;
      };
    } else {
      setupRef.current = appPreviewer.setup(
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
  }, [appPreviewer, storyboard]);

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
