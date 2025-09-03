import type { BrickConf } from "@next-core/types";
import type { Component } from "../interfaces.js";
import convertList from "./convertList.js";
import type { ConvertViewOptions } from "../interfaces.js";
import { convertEvents } from "./convertEvents.js";
import convertTable from "./convertTable.js";
import convertDescriptions from "./convertDescriptions.js";
import convertDashboard from "./convertDashboard.js";
import convertButton from "./convertButton.js";
import convertForm from "./convertForm.js";
import convertFormItem from "./convertFormItem.js";
import convertModal from "./convertModal.js";
import convertToolbar from "./convertToolbar.js";
import convertText from "./convertText.js";
import type { ConstructedView } from "../interfaces.js";
import convertCard from "./convertCard.js";
import convertForEach from "./convertForEach.js";
import convertIf from "./convertIf.js";
import convertOutput from "./convertOutput.js";
import convertLink from "./convertLink.js";
import convertTag from "./convertTag.js";

export async function convertComponent(
  component: Component,
  result: ConstructedView,
  options: ConvertViewOptions
): Promise<BrickConf | BrickConf[]> {
  let brick: BrickConf | null = null;
  switch (component.name) {
    case "List":
    case "eo-list":
      brick = await convertList(component);
      break;
    case "Table":
    case "eo-table":
      brick = await convertTable(component, result, options);
      break;
    case "Descriptions":
    case "eo-descriptions":
      brick = await convertDescriptions(component, result, options);
      break;
    case "Card":
      brick = await convertCard(component);
      break;
    case "Dashboard":
    case "eo-dashboard":
      brick = await convertDashboard(component, result, options);
      break;
    case "Button":
    case "eo-button":
      brick = await convertButton(component);
      break;
    case "Form":
    case "eo-form":
      brick = await convertForm(component);
      break;
    case "Toolbar":
    case "eo-toolbar":
      brick = await convertToolbar(component);
      break;
    case "Modal":
    case "eo-modal":
      brick = await convertModal(component);
      break;
    case "Plaintext":
    case "eo-text":
      brick = await convertText(component);
      break;
    case "Link":
      brick = await convertLink(component);
      break;
    case "Output":
      brick = await convertOutput(component);
      break;
    case "Tag":
      brick = await convertTag(component);
      break;
    case "eo-search":
    case "eo-input":
    case "eo-number-input":
    case "eo-textarea":
    case "eo-select":
    case "eo-radio":
    case "eo-checkbox":
    case "eo-switch":
    case "eo-date-picker":
    case "eo-time-picker":
    case "Search":
    case "Input":
    case "NumberInput":
    case "Textarea":
    case "Select":
    case "Radio":
    case "Checkbox":
    case "Switch":
    case "DatePicker":
    case "TimePicker":
      brick = await convertFormItem(
        component,
        convertComponentName(component.name)
      );
      break;
    case "ForEach":
      brick = await convertForEach(component);
      break;
    case "If":
      brick = await convertIf(component);
      break;
    default:
      // eslint-disable-next-line no-console
      console.error("Unsupported component:", component.name);
  }

  if (!brick) {
    return [];
  }

  // Set [data-component-id] for the brick
  if (component.componentId) {
    brick.properties ??= {};
    brick.properties.dataset ??= {};
    (brick.properties.dataset as Record<string, string>).componentId =
      component.componentId;
  }

  if (component.slot) {
    brick.slot = component.slot;
  }

  brick.events = convertEvents(component, options);

  if (component.children?.length) {
    brick.children = (
      await Promise.all(
        component.children.map((child) =>
          convertComponent(child, result, options)
        )
      )
    ).flat();

    if (component.name === "Card" && brick.children.length > 1) {
      brick.children = [
        {
          brick: "eo-content-layout",
          children: brick.children,
        },
      ];
    }
  }

  return brick;
}

function convertComponentName(name: string) {
  return name.includes("-")
    ? name
    : `eo${name.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
}
