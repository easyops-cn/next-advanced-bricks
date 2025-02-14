import React from "react";
import type { BasicDecoratorProps, DecoratorType } from "../interfaces";
import { DecoratorArea } from "./DecoratorArea";
import { DecoratorText } from "./DecoratorText";
import { DecoratorContainer } from "./DecoratorContainer";
import { DecoratorRect } from "./DecoratorRect";
import { DecoratorLine } from "./DecoratorLine";

const decoratorComponents = new Map<
  DecoratorType,
  React.ComponentType<BasicDecoratorProps>
>([
  ["container", DecoratorContainer],
  ["area", DecoratorArea],
  ["text", DecoratorText],
  ["rect", DecoratorRect],
  ["line", DecoratorLine],
]);

export function DecoratorComponent({
  cell,
  view,
  transform,
  readOnly,
  layout,
  layoutOptions,
  active,
  activeTarget,
  cells,
  lineConfMap,
  editableLineMap,
  onCellResizing,
  onCellResized,
  onSwitchActiveTarget,
  onDecoratorTextEditing,
  onDecoratorTextChange,
}: BasicDecoratorProps): JSX.Element | null {
  const SpecifiedComponent = decoratorComponents.get(cell.decorator);

  if (!SpecifiedComponent) {
    // eslint-disable-next-line no-console
    console.error(`Unknown decorator: ${cell.decorator}`);
    return null;
  }

  return (
    <SpecifiedComponent
      cell={cell}
      view={view}
      transform={transform}
      readOnly={readOnly}
      layout={layout}
      layoutOptions={layoutOptions}
      active={active}
      activeTarget={activeTarget}
      cells={cells}
      lineConfMap={lineConfMap}
      editableLineMap={editableLineMap}
      onCellResizing={onCellResizing}
      onCellResized={onCellResized}
      onSwitchActiveTarget={onSwitchActiveTarget}
      onDecoratorTextEditing={onDecoratorTextEditing}
      onDecoratorTextChange={onDecoratorTextChange}
    />
  );
}
