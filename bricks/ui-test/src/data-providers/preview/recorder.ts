// istanbul ignore file: working in progress
import * as t from "@babel/types";
import { transformFromAst } from "@babel/standalone";
import {
  getPossibleTargets,
  getTagName,
  previewFromOrigin,
  toggleInspecting,
} from "./inspector.js";
import type { InspectTarget, RecordStep } from "./interfaces.js";

let isRecording = false;
let currentKeydownTargets: InspectTarget[] | null = null;
let currentKeydownTexts: string[];
let steps: RecordStep[];
let isComposing = false;

const customRecorders: Record<string, (event: CustomEvent<any>) => void> = {
  "general.select.change": (event: CustomEvent<string | null>) => {
    // Ensure the event target is a `forms.general-select` element
    const tagName = getTagName(event.target);
    if (tagName !== "forms.general-select") {
      return;
    }

    // When using custom recorders, always append the event target as the last target.
    const targets = getPossibleTargets(event.composedPath());
    appendTarget(targets, event.target as HTMLElement, tagName);

    // Generate the code to replay user behavior.
    // Use Babel to generate the code from AST, instead of construct the code manually.

    // The expr below is equal to:
    // - Case null: `brick_clear()`
    // - Case string: `brick_clickItem(${JSON.stringify(event.detail)})`
    const expr =
      event.detail === null
        ? t.callExpression(t.identifier("brick_clear"), [])
        : t.callExpression(t.identifier("brick_clickItem"), [
            t.stringLiteral(event.detail),
          ]);
    const text = generateCodeText(expr);

    steps.push({
      event: "code",
      targets: targets.map((t) => t.selectors),
      text,
    });
  },
  // TODO: add more custom recorders as needed
};

// TODO: add more custom recorder bricks and extra selectors as needed
const customRecorderBricks: string[] = ["forms.general-select"];
const extraCustomRecorderSelectors: string[] = [".ant-select-dropdown"];

/**
 * Do not record any events inside custom recorder bricks or extra selectors.
 */
function shouldIgnoreRecording(targets: EventTarget[]): boolean {
  return targets.some((target) => {
    const tagName = getTagName(target);
    if (!!tagName && customRecorderBricks.includes(tagName)) {
      return true;
    }
    return extraCustomRecorderSelectors.some((selector) => {
      return target instanceof HTMLElement && target.matches(selector);
    });
  });
}

/**
 * Use Babel to generate the code from AST, instead of construct the code manually.
 */
function generateCodeText(expr: t.Expression): string {
  const program = t.program([t.expressionStatement(expr)], undefined, "module");
  const result = transformFromAst(program, undefined, {
    generatorOpts: {
      jsescOption: {
        minimal: true,
      },
    },
    cloneInputAst: false,
  });
  return result.code as string;
}

/**
 * When using custom recorders, always append the event target as the last target.
 */
function appendTarget(
  targets: InspectTarget[],
  element: HTMLElement,
  tag: string
): void {
  const lastTarget = targets[targets.length - 1];
  // Do not append the target if it is already the last one
  if (lastTarget?.element !== element) {
    targets.push({
      element,
      selectors: [
        {
          type: "css-selector",
          // Escape special characters in CSS selector
          value: tag.replaceAll(".", "\\."),
          tag,
        },
      ],
    });
  }
}

export function toggleRecording(recording: boolean, inspecting: boolean): void {
  if (isRecording === recording) {
    return;
  }
  isRecording = recording;
  if (inspecting) {
    toggleInspecting(!recording);
  }
  if (recording) {
    steps = [];
    window.addEventListener("click", onMouseEvent, {
      capture: true,
      passive: true,
    });
    window.addEventListener("dblclick", onMouseEvent, {
      capture: true,
      passive: true,
    });
    window.addEventListener("keydown", onKeyDown, {
      capture: true,
      passive: true,
    });
    window.addEventListener("compositionstart", onCompositionStart, {
      capture: true,
      passive: true,
    });
    window.addEventListener("compositionend", onCompositionEnd, {
      capture: true,
      passive: true,
    });
    for (const [eventType, handler] of Object.entries(customRecorders)) {
      window.addEventListener(eventType, handler as EventListener, {
        capture: true,
        passive: true,
      });
    }
  } else {
    completeKeyDown();
    currentKeydownTargets = null;
    window.removeEventListener("click", onMouseEvent, { capture: true });
    window.removeEventListener("dblclick", onMouseEvent, { capture: true });
    window.removeEventListener("keydown", onKeyDown, { capture: true });
    window.removeEventListener("compositionstart", onCompositionStart, {
      capture: true,
    });
    window.removeEventListener("compositionend", onCompositionEnd, {
      capture: true,
    });
    for (const [eventType, handler] of Object.entries(customRecorders)) {
      window.removeEventListener(eventType, handler as EventListener, {
        capture: true,
      });
    }

    if (steps.length > 0) {
      window.parent.postMessage(
        {
          channel: "ui-test-preview",
          type: "record-complete",
          payload: {
            steps,
          },
        },
        previewFromOrigin
      );
    }
  }
}

function onMouseEvent(event: MouseEvent): void {
  completeKeyDown();
  currentKeydownTargets = null;
  const eventTargets = event.composedPath();
  const targets = getPossibleTargets(eventTargets);
  if (targets.length === 0) {
    return;
  }

  if (shouldIgnoreRecording(eventTargets)) {
    return;
  }

  steps.push({
    event: event.type,
    targets: targets.map((t) => t.selectors),
  });
}

function onKeyDown(event: KeyboardEvent): void {
  // Ignore keydown events during composition
  if (isComposing) {
    return;
  }

  // If the target of keydown is not changed,
  // consider these events as a sequential typing.
  const eventTargets = event.composedPath();
  const targets = getPossibleTargets(eventTargets);
  const firstTarget = targets[0];
  if (targets.length === 0) {
    currentKeydownTargets = null;
    return;
  }
  const targetChanged =
    firstTarget.element !== currentKeydownTargets?.[0]?.element;
  if (targetChanged) {
    completeKeyDown();
  }

  if (shouldIgnoreRecording(eventTargets)) {
    return;
  }

  if (!targetChanged) {
    currentKeydownTargets = targets;
    currentKeydownTexts = [];
  }

  // Todo: handle modifiers
  switch (event.key) {
    case "Backspace":
      currentKeydownTexts.push("{backspace}");
      break;
    case "Enter":
      currentKeydownTexts.push("{enter}");
      break;
    case "Escape":
      currentKeydownTexts.push("{esc}");
      break;
    // Todo: handle other keys
    default:
      if (event.key.length === 1) {
        currentKeydownTexts.push(event.key);
      }
  }
}

function onCompositionStart() {
  isComposing = true;
}

function onCompositionEnd(event: CompositionEvent) {
  isComposing = false;

  // If the target of keydown is not changed,
  // consider these events as a sequential typing.
  const targets = getPossibleTargets(event.composedPath());
  const firstTarget = targets[0];
  if (targets.length === 0) {
    currentKeydownTargets = null;
    return;
  }
  if (firstTarget.element !== currentKeydownTargets?.[0]?.element) {
    completeKeyDown();
    currentKeydownTargets = targets;
    currentKeydownTexts = [];
  }

  // Add the composed text to the current keydown texts
  currentKeydownTexts.push(event.data);
}

function completeKeyDown(): void {
  if (currentKeydownTargets && currentKeydownTexts.length > 0) {
    steps.push({
      event: "type",
      targets: currentKeydownTargets.map((t) => t.selectors),
      text: currentKeydownTexts.join(""),
    });
  }
}
