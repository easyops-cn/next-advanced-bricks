import React from "react";
import { wrapBrick } from "@next-core/react-element";
import { unwrapProvider } from "@next-core/utils/general";
import { asyncWrapBrick } from "@next-core/react-runtime";
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
import type { copyToClipboard as _copyToClipboard } from "@next-bricks/basic/data-providers/copy-to-clipboard";
import { PopoverProps, Popover } from "@next-bricks/basic/popover";
import { EoNextTable, NextTableProps } from "@next-bricks/advanced/next-table";
import {
  CodeBlock,
  CodeBlockProps,
} from "@next-bricks/presentational/code-block";
import type { IconButton, IconButtonProps } from "../icon-button";
import type {
  ChatInput,
  ChatInputEvents,
  ChatInputMapEvents,
  ChatInputProps,
} from "../chat-input";
import type { ShowCase, ShowCaseProps } from "../show-case";
import type {
  RunningFlow,
  RunningFlowEvents,
  RunningFlowMapEvents,
  RunningFlowProps,
} from "../running-flow";
import type { BlankState, BlankStateProps } from "../blank-state";

export const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");

export const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");

export const WrappedTooltip = wrapBrick<EoTooltip, ToolTipProps>("eo-tooltip");

export const WrappedPopover = wrapBrick<Popover, PopoverProps>("eo-popover");

export const WrappedDrawer = wrapBrick<
  Drawer,
  DrawerProps & { keyboard?: boolean },
  DrawerEvents,
  DrawerMapEvents
>("eo-drawer", {
  onClose: "close",
  onOpen: "open",
});

export const WrappedIconButton = wrapBrick<IconButton, IconButtonProps>(
  "ai-portal.icon-button"
);

export const WrappedChatInput = wrapBrick<
  ChatInput,
  ChatInputProps,
  ChatInputEvents,
  ChatInputMapEvents
>("ai-portal.chat-input", {
  onChatSubmit: "chat.submit",
  onTerminate: "terminate",
});

export const WrappedShowCase = wrapBrick<ShowCase, ShowCaseProps>(
  "ai-portal.show-case"
);

export const WrappedCodeBlock = wrapBrick<CodeBlock, CodeBlockProps>(
  "eo-code-block"
);

export const WrappedBlankState = wrapBrick<BlankState, BlankStateProps>(
  "ai-portal.blank-state"
);

export const WrappedRunningFlow = wrapBrick<
  RunningFlow,
  RunningFlowProps,
  RunningFlowEvents,
  RunningFlowMapEvents
>("ai-portal.running-flow", {
  onActiveChange: "active.change",
});

export const showDialog =
  unwrapProvider<typeof _showDialog>("basic.show-dialog");

export const copyToClipboard = unwrapProvider<typeof _copyToClipboard>(
  "basic.copy-to-clipboard"
);

export const AsyncWrappedTable = React.lazy(async () => ({
  default: await asyncWrapBrick<EoNextTable, NextTableProps>("eo-next-table"),
}));
