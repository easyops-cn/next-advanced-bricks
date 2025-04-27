import React from "react";
import { wrapBrick } from "@next-core/react-element";
import type {
  EoSidebarMenuItem,
  EoSidebarMenuItemProps,
} from "@next-bricks/nav/sidebar/sidebar-menu-item";
import { useDrag } from "react-dnd";

import { WorkbenchComponent } from "../interfaces";

const WrappedSidebarMenuItem = wrapBrick<
  EoSidebarMenuItem,
  EoSidebarMenuItemProps
>("eo-sidebar-menu-item");

export interface DraggableComponentMenuItemProps {
  component: WorkbenchComponent;
  onClick?(): void;
}

export function DraggableComponentMenuItem(
  props: DraggableComponentMenuItemProps
): React.ReactElement {
  const { component, onClick } = props;
  const { title } = component;
  /* istanbul ignore next */
  const [{ isDragging }, drag] = useDrag({
    type: "component",
    item: component,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <WrappedSidebarMenuItem
      icon={{
        lib: "antd",
        icon: "menu",
      }}
      title={title}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      onClick={onClick}
      data-testid="draggable-component-menu-item"
      ref={drag}
    >
      {title}
    </WrappedSidebarMenuItem>
  );
}
