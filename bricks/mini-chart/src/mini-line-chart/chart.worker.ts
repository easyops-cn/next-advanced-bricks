import { expose } from "comlink";
import { drawMiniLineChart, type MiniLineChartOptions } from "./draw";

const CanvasMap = new Map<string, OffscreenCanvas>();

class CanvasChartWorker {
  /**
   * Set a unique id for the canvas
   */
  init(id: string, canvas: OffscreenCanvas) {
    CanvasMap.set(id, canvas);
  }

  /**
   * Dispose the canvas by its unique id
   */
  dispose(id: string) {
    CanvasMap.delete(id);
  }

  drawMiniLineChart(id: string, options: MiniLineChartOptions) {
    const canvas = CanvasMap.get(id);
    if (!canvas) {
      throw new Error(`Canvas not found for id: "${id}"`);
    }

    const ctx = canvas.getContext("2d")!;
    drawMiniLineChart(ctx, options);
  }
}

expose(CanvasChartWorker);
