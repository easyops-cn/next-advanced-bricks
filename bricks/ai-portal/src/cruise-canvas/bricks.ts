import { wrapBrick } from "@next-core/react-element";
import { unwrapProvider } from "@next-core/utils/general";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type { Button, ButtonProps } from "@next-bricks/basic/button";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import type { EoTooltip, ToolTipProps } from "@next-bricks/basic/tooltip";
import type {
  Drawer,
  DrawerProps,
  DrawerEvents,
  DrawerMapEvents,
} from "@next-bricks/containers/drawer";
import type { showDialog as _showDialog } from "@next-bricks/basic/data-providers/show-dialog/show-dialog";
import { PopoverProps, Popover } from "@next-bricks/basic/popover";
import {
  EoNextTable,
  NextTableComponentProps,
} from "@next-bricks/advanced/next-table";

type FilteredNextTableComponentProps = Omit<
  NextTableComponentProps,
  "ref" | "shadowRoot" | "childrenColumnName"
>;

export const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");

export const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");

export const WrappedTooltip = wrapBrick<EoTooltip, ToolTipProps>("eo-tooltip");

export const WrappedPopover = wrapBrick<Popover, PopoverProps>("eo-popover");

export const WrappedTable = wrapBrick<
  EoNextTable,
  FilteredNextTableComponentProps
>("eo-next-table");

export const WrappedDrawer = wrapBrick<
  Drawer,
  DrawerProps,
  DrawerEvents,
  DrawerMapEvents
>("eo-drawer", {
  onClose: "close",
  onOpen: "open",
});

export const showDialog =
  unwrapProvider<typeof _showDialog>("basic.show-dialog");
