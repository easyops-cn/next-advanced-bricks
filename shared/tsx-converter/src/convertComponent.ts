import type { BrickConf, ContextConf, RouteConf } from "@next-core/types";
import {
  isAnyOfficialComponent,
  type ComponentChild,
  type ModulePart,
  type ParsedModule,
} from "@next-shared/tsx-parser";
import type { ConvertState, ConvertOptions } from "./interfaces.js";
import { convertEvents } from "./convertEvents.js";
import convertList from "./convertList.js";
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
import convertCodeBlock from "./convertCodeBlock.js";
import { getAppTplName, getViewTplName } from "./modules/getTplName.js";
import { convertRoutes } from "./modules/convertRoutes.js";
import { convertLifeCycle } from "./convertLifeCycle.js";

const PORTAL_COMPONENTS = ["eo-modal", "eo-drawer"];

export async function convertComponent(
  component: ComponentChild,
  mod: ParsedModule,
  state: ConvertState,
  options: ConvertOptions,
  scope: "page" | "view" | "template"
): Promise<BrickConf | BrickConf[] | RouteConf | RouteConf[]> {
  let brick: BrickConf | RouteConf | null = null;

  if (isAnyOfficialComponent(component)) {
    const componentName = component.reference
      ? component.reference.name
      : component.name;
    switch (componentName) {
      case "List":
        brick = await convertList(component);
        break;
      case "Table":
        brick = await convertTable(component, mod, state, options, scope);
        break;
      case "Descriptions":
        brick = await convertDescriptions(
          component,
          mod,
          state,
          options,
          scope
        );
        break;
      case "Card":
        brick = await convertCard(component);
        break;
      case "Dashboard":
        brick = await convertDashboard(component, mod, state, options);
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
        brick = await convertLink(component, mod, state);
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
      case "Routes":
        return convertRoutes(component.children, state, mod, options);
      case "Route":
        // Route is handled in convertRoutes
        // eslint-disable-next-line no-console
        console.error("<Route> should be a child of <Routes>.");
        break;
      default:
        // Allow any bricks in app mode or when allowAnyBricks is true
        if (
          (state.app.appType === "app" || options.allowAnyBricks) &&
          component.name.toLowerCase() === component.name
        ) {
          brick = {
            brick: component.name.replaceAll("_", ".").replaceAll("--", "."),
            properties: component.properties,
          };
        } else {
          // eslint-disable-next-line no-console
          console.error("Unknown component:", component.name);
        }
    }
  } else {
    const { type, importSource, name } = component.reference!;
    let refPart: ModulePart | null | undefined;
    if (type === "imported") {
      const imported = state.app.modules.get(importSource!);
      refPart = name
        ? imported?.namedExports.get(name)
        : imported?.defaultExport;
    } else {
      const parts = [...mod.internals, ...mod.namedExports.values()];
      refPart = parts.find(
        (part) => part.type === "template" && part.component.id?.name === name
      );
    }
    if (refPart?.type === "template") {
      const tplName = refPart.component.id!.name;
      brick = {
        brick:
          state.app.appType === "app"
            ? getAppTplName(tplName)
            : getViewTplName(tplName, options.rootId),
        properties: component.properties,
      };
    } else {
      // eslint-disable-next-line no-console
      console.error(
        `Cannot find the component "${component.reference!.name}".`
      );
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

  brick.lifeCycle = convertLifeCycle(component, options);

  if (component.children?.length) {
    brick.children = (
      await Promise.all(
        component.children.map(
          (child) =>
            convertComponent(child, mod, state, options, scope) as Promise<
              BrickConf | BrickConf[]
            >
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

  if (component.portal || PORTAL_COMPONENTS.includes(brick.brick)) {
    brick.portal = true;
  }

  if (component.context) {
    (brick as { context?: ContextConf[] }).context = component.context;
  }

  return brick;
}

function convertComponentName(name: string) {
  return name.includes("-")
    ? name
    : `eo${name.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
}
