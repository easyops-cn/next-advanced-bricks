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

import type { IconButton, IconButtonProps } from "../icon-button";
import { TagProps, Tag } from "@next-bricks/basic/tag";
import { Input, InputProps } from "@next-bricks/form/input";
import { Textarea, TextareaProps } from "@next-bricks/form/textarea";

export const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");

export const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");

export const WrappedDrawer = wrapBrick<
  Drawer,
  DrawerProps & {
    keyboard?: boolean;
    themeVariant?: "default" | "elevo";
  },
  DrawerEvents,
  DrawerMapEvents
>("eo-drawer", {
  onClose: "close",
  onOpen: "open",
});

export const WrappedIconButton = wrapBrick<IconButton, IconButtonProps>(
  "ai-portal.icon-button"
);

export const WrappedTag = wrapBrick<Tag, TagProps>("eo-tag");

export interface InputEvents {
  change: CustomEvent<string>;
}
export interface InputEventsMap {
  onValueChange: "change";
}

export const WrappedInput = wrapBrick<
  Input,
  InputProps,
  InputEvents,
  InputEventsMap
>("eo-input", {
  onValueChange: "change",
});

export interface TextareaEvents {
  change: CustomEvent<string>;
}
export interface TextareaEventsMap {
  onValueChange: "change";
}
export const WrappedTextarea = wrapBrick<
  Textarea,
  TextareaProps,
  TextareaEvents,
  TextareaEventsMap
>("eo-textarea", {
  onValueChange: "change",
});
