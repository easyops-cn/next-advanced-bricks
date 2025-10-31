import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import type {
  EoDropdownActions,
  DropdownActionsProps,
  DropdownActionsEvents,
  DropdownActionsEventsMapping,
} from "@next-bricks/basic/dropdown-actions";
import type {
  EoEasyopsAvatar,
  EoEasyopsAvatarProps,
} from "@next-bricks/basic/easyops-avatar";
import type {
  EoMiniActions,
  EoMiniActionsEvents,
  EoMiniActionsEventsMapping,
  EoMiniActionsProps,
} from "@next-bricks/basic/mini-actions";
import type { IconButton, IconButtonProps } from "../icon-button";

export const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
export const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");
export const WrappedDropdownActions = wrapBrick<
  EoDropdownActions,
  DropdownActionsProps & { themeVariant?: "default" | "elevo" },
  DropdownActionsEvents,
  DropdownActionsEventsMapping
>("eo-dropdown-actions", {
  onActionClick: "action.click",
  onVisibleChange: "visible.change",
});
export const WrappedEasyopsAvatar = wrapBrick<
  EoEasyopsAvatar,
  EoEasyopsAvatarProps
>("eo-easyops-avatar");
export const WrappedMiniActions = wrapBrick<
  EoMiniActions,
  EoMiniActionsProps & { themeVariant?: "default" | "elevo" },
  EoMiniActionsEvents,
  EoMiniActionsEventsMapping
>("eo-mini-actions", {
  onActionClick: "action.click",
  onVisibleChange: "visible.change",
});
export const WrappedIconButton = wrapBrick<IconButton, IconButtonProps>(
  "ai-portal.icon-button"
);
