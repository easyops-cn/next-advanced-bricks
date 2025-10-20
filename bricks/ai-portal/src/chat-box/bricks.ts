import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type {
  ActionsEvents,
  ActionsEventsMapping,
  ActionsProps,
  EoActions,
} from "@next-bricks/basic/actions";
import type { IconButton, IconButtonProps } from "../icon-button";

export const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
export const WrappedActions = wrapBrick<
  EoActions,
  ActionsProps & { activeKeys?: (string | number)[] },
  ActionsEvents,
  ActionsEventsMapping
>("eo-actions", {
  onActionClick: "action.click",
  onItemDragEnd: "item.drag.end",
  onItemDragStart: "item.drag.start",
});
export const WrappedIconButton = wrapBrick<IconButton, IconButtonProps>(
  "ai-portal.icon-button"
);
