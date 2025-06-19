import { RecordStep } from "./interfaces";

class RecordContext {
  steps: RecordStep[] = [];
  brickEvtStepCache: Map<EventTarget, Record<string, RecordStep>> = new Map();

  addStep(step: RecordStep) {
    this.steps.push(step);
  }

  clearSteps() {
    this.steps = [];
  }

  getSteps() {
    return this.steps;
  }
}

export const recordContext = new RecordContext();
