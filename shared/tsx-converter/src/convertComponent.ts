import type { BrickConf } from "@next-core/types";
import type { Component, ParseResult } from "@next-shared/tsx-parser";
import convertList from "./convertList.js";
import type { ConvertOptions } from "./interfaces.js";
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
import convertCard from "./convertCard.js";
import convertForEach from "./convertForEach.js";
import convertIf from "./convertIf.js";
import convertOutput from "./convertOutput.js";
import convertLink from "./convertLink.js";
import convertTag from "./convertTag.js";
import convertAvatar from "./convertAvatar.js";
import convertAvatarGroup from "./convertAvatarGroup.js";
import {
  getTplNamePrefixByRootId,
  getTplNameSuffix,
} from "./convertTemplates.js";
import convertCodeBlock from "./convertCodeBlock.js";

export async function convertComponent(
  component: Component,
  result: ParseResult,
  options: ConvertOptions,
  scope: "view" | "template"
): Promise<BrickConf | BrickConf[]> {
  let brick: BrickConf | null = null;
  const tpl = result.templates.find((t) => t.name === component.name);
  if (tpl) {
    brick = {
      brick: `${getTplNamePrefixByRootId(options.rootId)}${getTplNameSuffix(tpl.name)}`,
      properties: component.properties,
    };
  } else {
    switch (component.name) {
      case "List":
        brick = await convertList(component);
        break;
      case "Table":
        brick = await convertTable(component, result, options, scope);
        break;
      case "Descriptions":
        brick = await convertDescriptions(component, result, options, scope);
        break;
      case "Card":
        brick = await convertCard(component);
        break;
      case "Dashboard":
        brick = await convertDashboard(component, result, options);
        break;
      case "Button":
        brick = await convertButton(component);
        break;
      case "Form":
        brick = await convertForm(component);
        break;
      case "Toolbar":
        brick = await convertToolbar(component);
        break;
      case "Modal":
        brick = await convertModal(component);
        break;
      case "Plaintext":
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
      case "Avatar":
        brick = await convertAvatar(component);
        break;
      case "AvatarGroup":
        brick = await convertAvatarGroup(component);
        break;
      case "CodeBlock":
        brick = await convertCodeBlock(component);
        break;
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
  }

  if (!brick) {
    return [];
  }

  if (component.ref) {
    if (scope === "template") {
      (brick as { ref?: string }).ref = component.ref;
    } else {
      brick.properties ??= {};
      brick.properties.dataset ??= {};
      (brick.properties.dataset as Record<string, string>).ref = component.ref;
    }
  }

  if (component.slot) {
    brick.slot = component.slot;
  }

  brick.events = convertEvents(component, options);

  if (component.children?.length) {
    brick.children = (
      await Promise.all(
        component.children.map((child) =>
          convertComponent(child, result, options, scope)
        )
      )
    ).flat();

    if (
      (component.name === "Card" || component.name === "Modal") &&
      brick.children.length > 0
    ) {
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
