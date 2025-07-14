import type { BrickConf } from "@next-core/types";
import type { Component } from "./interfaces.js";

export default function convertModal(component: Component): BrickConf {
  const { properties } = component;
  const { title, confirmText, cancelText } = properties as {
    title?: string;
    confirmText?: string;
    cancelText?: string;
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
    },
  };
}
