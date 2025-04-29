import React from "react";
import { wrapBrick } from "@next-core/react-element";
import type {
  EoSidebarMenuItem,
  EoSidebarMenuItemProps,
} from "@next-bricks/nav/sidebar/sidebar-menu-item";

import { WorkbenchComponent } from "../interfaces";

const WrappedSidebarMenuItem = wrapBrick<
  EoSidebarMenuItem,
  EoSidebarMenuItemProps
>("eo-sidebar-menu-item");

export interface DraggableComponentMenuItemProps {
  component: WorkbenchComponent;
  onClick?(): void;
  onDragStart?(): void;
  onDragEnd?(): void;
}

export function DraggableComponentMenuItem(
  props: DraggableComponentMenuItemProps
): React.ReactElement {
  const { component, onClick, onDragStart, onDragEnd } = props;
  const { key, title } = component;

  return (
    <WrappedSidebarMenuItem
      icon={{
        lib: "antd",
        icon: "menu",
      }}
      title={title}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", key);
        onDragStart?.();
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      data-testid="draggable-component-menu-item"
    >
      {title}
    </WrappedSidebarMenuItem>
  );
}
