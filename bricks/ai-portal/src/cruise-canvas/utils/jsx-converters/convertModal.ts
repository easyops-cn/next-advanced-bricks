import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/jsx-storyboard";
import type { ModalProps } from "@next-shared/jsx-storyboard/lib/components.js";

export default function convertModal(component: Component): BrickConf {
  const { properties } = component;
  const { title, confirmText, cancelText, textContent } =
    properties as Partial<ModalProps> & {
      textContent?: string;
    };
  return {
    brick: "eo-modal",
    portal: true,
    properties: {
      themeVariant: "elevo",
      modalTitle: title,
      confirmText: confirmText,
      cancelText: cancelText,
      keyboard: true,
      ...(textContent ? { textContent } : null),
    },
  };
}
