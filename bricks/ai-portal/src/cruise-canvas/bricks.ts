import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type { Button, ButtonProps } from "@next-bricks/basic/button";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import type {
  Drawer,
  DrawerProps,
  DrawerEvents,
  DrawerMapEvents,
} from "@next-bricks/containers/drawer";

export const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");

export const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");

export const WrappedDrawer = wrapBrick<
  Drawer,
  DrawerProps,
  DrawerEvents,
  DrawerMapEvents
>("eo-drawer", {
  onClose: "close",
  onOpen: "open",
});
