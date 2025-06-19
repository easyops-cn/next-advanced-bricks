import { EventHandlerOptions, BrickEvtMapField } from "./interfaces";
import { getTagName, getPossibleTargets } from "./inspector";
import { hasOwnProperty } from "@next-core/utils/general";
import { appendTarget } from "./recorder";
import { recordContext } from "./RecordContext";

export function brickEvtHandler(
  event: CustomEvent<string | null>,
  options: EventHandlerOptions
) {
  const { brickEvtMap, brickEvtName } = options;

  const tagName = getTagName(event.target) as string;

  const callback =
    hasOwnProperty(brickEvtMap, tagName) &&
    hasOwnProperty(brickEvtMap[tagName], brickEvtName)
      ? brickEvtMap[tagName as string][brickEvtName]
      : undefined;

  if (!callback) {
    return;
  }

  callback(event);
}

export function createBrickEvtHandler(formBrickMap: BrickEvtMapField) {
  const eventList = Object.values(formBrickMap).flatMap((valueMap) =>
    Object.keys(valueMap)
  );

  return Object.fromEntries(
    Array.from(new Set(eventList)).map((evtName) => [
      evtName,
      /* istanbul ignore next */
      (event: CustomEvent<any>) =>
        brickEvtHandler(event, {
          brickEvtName: evtName,
          brickEvtMap: formBrickMap,
        }),
    ])
  );
}

export function generateBaseStep(event: CustomEvent<any>, text: string) {
  const tagName = getTagName(event.target);
  const targets = getPossibleTargets(event.composedPath());
  appendTarget(targets, event.target as HTMLElement, tagName as string);

  recordContext.addStep({
    event: "code",
    targets: targets.map((t) => t.selectors),
    text,
  });
}

export function generateBrickInputStep(
  event: CustomEvent<any>,
  text: string,
  options: { brickEvtName: string }
) {
  const { brickEvtName } = options;
  const tagName = getTagName(event.target);
  const targets = getPossibleTargets(event.composedPath());
  appendTarget(targets, event.target as HTMLElement, tagName as string);

  const matchedBrick = recordContext.brickEvtStepCache.get(
    event.target as EventTarget
  );
  const matchedPrevStep = hasOwnProperty(matchedBrick ?? {}, brickEvtName)
    ? matchedBrick?.[brickEvtName]
    : undefined;

  if (matchedPrevStep) {
    matchedPrevStep.text = text;
  } else {
    const newStep = {
      event: "code",
      targets: targets.map((t) => t.selectors),
      text,
    };

    recordContext.addStep(newStep);

    if (matchedBrick) {
      matchedBrick[brickEvtName as string] = newStep;
    } else {
      recordContext.brickEvtStepCache.set(event.target as EventTarget, {
        [brickEvtName as string]: newStep,
      });
    }
  }
}
