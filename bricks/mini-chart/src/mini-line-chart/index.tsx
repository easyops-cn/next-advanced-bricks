import React, { useEffect } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { useTranslation, initializeReactI18n } from "@next-core/i18n/react";
import "@next-core/theme";
import * as Comlink from "comlink";
import { K, NS, locales } from "./i18n.js";
import type { MiniLineChartOptions } from "./worker";
import styleText from "./styles.shadow.css";

initializeReactI18n(NS, locales);

const PIXEL_RATIO = window.devicePixelRatio ?? 1;

const { defineElement, property } = createDecorators();

interface RemoteWorker {
  draw(canvas: OffscreenCanvas, options: MiniLineChartOptions): Promise<void>;
}

let remoteWorkerPromise: Promise<RemoteWorker> | undefined;

function getRemoteWorker() {
  if (!remoteWorkerPromise) {
    remoteWorkerPromise = (async () => {
      const Remote = Comlink.wrap(
        new Worker(new URL("./worker.ts", import.meta.url))
      ) as any;
      return await new Remote();
    })();
  }
  return remoteWorkerPromise;
}

export interface MiniLineChartProps {
  width?: number;
  height?: number;
  smooth?: boolean;
  lineColor?: string;
  xField?: string;
  yField?: string;
  data?: Record<string, number>[];
}

export type Point = [x: number, y: number];

/**
 * 构件 `eo-mini-line-chart`
 */
export
@defineElement("eo-mini-line-chart", {
  styleTexts: [styleText],
})
class MiniLineChart extends ReactNextElement implements MiniLineChartProps {
  /** @default 155 */
  @property({ type: Number })
  accessor width: number | undefined;

  /** @default 40 */
  @property({ type: Number })
  accessor height: number | undefined;

  /**
   * Use a smooth curve line or not.
   *
   * @default true
   */
  @property({ type: Boolean })
  accessor smooth: boolean | undefined;

  @property()
  accessor lineColor: string | undefined;

  /**
   * @default "0"
   */
  @property()
  accessor xField: string | undefined;

  /**
   * @default "1"
   */
  @property()
  accessor yField: string | undefined;

  @property({ attribute: false })
  accessor data: Record<string, number>[] | undefined;

  render() {
    return (
      <MiniLineChartComponent
        width={this.width}
        height={this.height}
        smooth={this.smooth}
        lineColor={this.lineColor}
        xField={this.xField}
        yField={this.yField}
        data={this.data}
      />
    );
  }
}

export interface MiniLineChartComponentProps extends MiniLineChartProps {
  // Define react event handlers here.
}

export function MiniLineChartComponent({
  width: _width,
  height: _height,
  smooth,
  lineColor,
  xField: _xField,
  yField: _yField,
  data,
}: MiniLineChartComponentProps) {
  const width = _width ?? 155;
  const height = _height ?? 40;
  const xField = _xField ?? "0";
  const yField = _yField ?? "1";
  const padding = 1;

  const { t } = useTranslation(NS);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const detectorRef = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const detector = detectorRef.current;
    if (!canvas || !detector) {
      return;
    }

    const offscreen = canvas.transferControlToOffscreen();

    (async () => {
      const remote = await getRemoteWorker();
      await remote.draw(Comlink.transfer(offscreen, [offscreen]), {
        pixelRation: PIXEL_RATIO,
        width,
        height,
        padding,
        smooth,
        lineColor: getComputedStyle(detector).color,
        xField,
        yField,
        data,
      });
    })();
  }, [data, height, lineColor, smooth, width, xField, yField]);

  if (!data?.length) {
    // No data
    return (
      <div style={{ width, height }}>
        <span>{t(K.NO_DATA)}</span>
      </div>
    );
  }

  return (
    <>
      <canvas
        width={width * PIXEL_RATIO}
        height={height * PIXEL_RATIO}
        ref={canvasRef}
        style={{ width, height }}
      />
      <span
        className="detector"
        ref={detectorRef}
        style={{ color: lineColor }}
      ></span>
    </>
  );
}
