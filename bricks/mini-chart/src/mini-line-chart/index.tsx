import React, { useEffect, useMemo, useRef, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { useTranslation, initializeReactI18n } from "@next-core/i18n/react";
import "@next-core/theme";
import { transfer } from "comlink";
import { uniqueId } from "lodash";
import ResizeObserver from "resize-observer-polyfill";
import { K, NS, locales } from "./i18n.js";
import { drawMiniLineChart, type MiniLineChartOptions } from "./draw.js";
import { getRemoteWorker } from "./getRemoteWorker.js";
import { getNumberOrAuto } from "./getNumberOrAuto.js";
import styleText from "./styles.shadow.css";

initializeReactI18n(NS, locales);

// istanbul ignore next
const PIXEL_RATIO = window.devicePixelRatio ?? 1;

const { defineElement, property } = createDecorators();

export interface MiniLineChartProps {
  width?: string;
  height?: string;
  smooth?: boolean;
  lineColor?: string;
  showArea?: boolean;
  min?: number;
  max?: number;
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
  /**
   * Set `auto` to make it fit the container width.
   *
   * @default "155"
   */
  @property()
  accessor width: string | undefined;

  /**
   * Set `auto` to make it fit the container height.
   *
   * @default "40"
   */
  @property()
  accessor height: string | undefined;

  /**
   * Use a smooth curve line or not.
   *
   * @default true
   */
  @property({ type: Boolean })
  accessor smooth: boolean | undefined;

  /**
   * @default "var(--color-brand)"
   */
  @property()
  accessor lineColor: string | undefined;

  @property({ type: Boolean })
  accessor showArea: boolean | undefined;

  /**
   * Specify the minimum value of the y-axis.
   * If not specified, the minimum value will be calculated from the data.
   */
  @property({ type: Number })
  accessor min: number | undefined;

  /**
   * Specify the maximum value of the y-axis.
   * If not specified, the maximum value will be calculated from the data.
   */
  @property({ type: Number })
  accessor max: number | undefined;

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
        root={this}
        width={this.width}
        height={this.height}
        smooth={this.smooth}
        lineColor={this.lineColor}
        showArea={this.showArea}
        min={this.min}
        max={this.max}
        xField={this.xField}
        yField={this.yField}
        data={this.data}
      />
    );
  }
}

export interface MiniLineChartComponentProps extends MiniLineChartProps {
  root: HTMLElement;
}

export function MiniLineChartComponent({
  root,
  width: _width,
  height: _height,
  smooth,
  lineColor: _lineColor,
  showArea,
  min,
  max,
  xField: _xField,
  yField: _yField,
  data,
}: MiniLineChartComponentProps) {
  const tempWidth = getNumberOrAuto(_width, 155);
  const tempHeight = getNumberOrAuto(_height, 40);
  const autoWidth = tempWidth === "auto";
  const autoHeight = tempHeight === "auto";
  const [width, setWidth] = useState(autoWidth ? null : tempWidth);
  const [height, setHeight] = useState(autoHeight ? null : tempHeight);
  const xField = _xField ?? "0";
  const yField = _yField ?? "1";
  const lineColor = _lineColor ?? "var(--color-brand)";
  const padding = 1;

  const { t } = useTranslation(NS);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<HTMLSpanElement>(null);
  const transferredCanvasRef = useRef(new WeakSet<HTMLCanvasElement>());
  const canvasId = useMemo(() => uniqueId("canvas-"), []);

  useEffect(() => {
    if (!autoWidth) {
      setWidth(tempWidth);
    }
  }, [autoWidth, tempWidth]);

  useEffect(() => {
    if (!autoHeight) {
      setHeight(tempHeight);
    }
  }, [autoHeight, tempHeight]);

  useEffect(() => {
    if (!autoWidth && !autoHeight) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === root) {
          if (autoWidth) {
            // istanbul ignore next
            const newWidth = entry.contentBoxSize
              ? entry.contentBoxSize[0].inlineSize
              : entry.contentRect.width;
            setWidth(newWidth);
          }
          if (autoHeight) {
            // istanbul ignore next
            const newHeight = entry.contentBoxSize
              ? entry.contentBoxSize[0].blockSize
              : entry.contentRect.height;
            setHeight(newHeight);
          }
        }
      }
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
    };
  }, [autoHeight, root, autoWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const detector = detectorRef.current;
    if (!canvas || !detector || !width || !height) {
      return;
    }

    const options: MiniLineChartOptions = {
      pixelRatio: PIXEL_RATIO,
      width,
      height,
      padding,
      smooth,
      lineColor: getComputedStyle(detector).color,
      showArea,
      min,
      max,
      xField,
      yField,
      data,
    };

    if (!canvas.transferControlToOffscreen) {
      // For browser does not support transfer OffscreenCanvas,
      // fallback to main thread rendering.
      const ctx = canvas.getContext("2d")!;
      drawMiniLineChart(ctx, options);
      return;
    }

    let ignore = false;
    (async () => {
      const remote = await getRemoteWorker();
      if (ignore) {
        return;
      }

      if (!transferredCanvasRef.current.has(canvas)) {
        const offscreen = canvas.transferControlToOffscreen();
        transferredCanvasRef.current.add(canvas);
        await remote.init(canvasId, transfer(offscreen, [offscreen]));
        if (ignore) {
          return;
        }
      }

      await remote.drawMiniLineChart(canvasId, options);
    })();

    return () => {
      ignore = true;
    };
  }, [
    canvasId,
    data,
    height,
    lineColor,
    max,
    min,
    showArea,
    smooth,
    width,
    xField,
    yField,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.transferControlToOffscreen) {
      // For browser do not support transfer OffscreenCanvas.
      return;
    }
    return () => {
      (async () => {
        const remote = await getRemoteWorker();
        await remote.dispose(canvasId);
      })();
    };
  }, [canvasId]);

  if (width === null || height === null) {
    return null;
  }

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
        data-id={canvasId}
      />
      <span
        className="detector"
        ref={detectorRef}
        style={{ color: lineColor }}
      ></span>
    </>
  );
}
