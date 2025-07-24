import { pipes } from "@easyops-cn/brick-next-pipes";
import type {
  Component,
  ConvertViewOptions,
  DataSource,
  Variable,
  ViewWithInfo,
} from "./interfaces.js";
import convertList from "./convertList.js";
import convertDescriptions from "./convertDescriptions.js";
import convertDashboard from "./convertDashboard.js";
import convertTable from "./convertTable.js";
import type { BrickConf, ContextConf } from "@next-core/types";
import convertButton from "./convertButton.js";
import convertForm from "./convertForm.js";
import convertFlexLayout from "./convertFlexLayout.js";
import convertFormItem from "./convertFormItem.js";
import convertModal from "./convertModal.js";
import { convertEvents } from "./convertEvents.js";
import { withBox } from "./withBox.js";

export interface BrickConfWithContext extends BrickConf {
  context?: ContextConf[];
}

export async function convertView(
  view: ViewWithInfo | null | undefined,
  options: ConvertViewOptions
): Promise<BrickConfWithContext | null> {
  if (!view) {
    return null;
  }

  const componentMap = new Map<string, Component>();
  const childrenMap = new Map<string, Component[]>();
  const rootComponents: Component[] = [];
  const convertedComponents = new Set<string>();

  for (const component of view.components) {
    componentMap.set(component.componentId, component);
    if (component.parentComponentId) {
      let children = childrenMap.get(component.parentComponentId);
      if (!children) {
        children = [];
        childrenMap.set(component.parentComponentId, children);
      }
      children.push(component);
    } else {
      rootComponents.push(component);
    }
  }

  const convert = async (component: Component): Promise<BrickConf | null> => {
    if (convertedComponents.has(component.componentId)) {
      throw new Error(
        `Component ${component.componentId} has been converted already, it indicates a circular component tree.`
      );
    }
    convertedComponents.add(component.componentId);

    let brick: BrickConf | null = null;
    switch (component.componentName) {
      case "list":
        brick = await convertList(component);
        break;
      case "table":
        brick = await convertTable(component, view, options);
        break;
      case "descriptions":
        brick = await convertDescriptions(component, view, options);
        break;
      case "dashboard":
        brick = await convertDashboard(component, view, options);
        break;
      case "button":
        brick = await convertButton(component);
        break;
      case "form":
        brick = await convertForm(component);
        break;
      case "form-item":
        brick = await convertFormItem(component);
        break;
      case "flex-layout":
        brick = await convertFlexLayout(component);
        break;
      case "modal":
        brick = await convertModal(component);
        break;
    }

    if (!brick) {
      return null;
    }

    brick.events = convertEvents(component, view, options);

    // Set [data-component-id] for the brick
    brick.properties ??= {};
    brick.properties.dataset ??= {};
    (brick.properties.dataset as Record<string, string>).componentId =
      component.componentId;

    const children = (
      await Promise.all(
        (childrenMap.get(component.componentId) ?? []).map(convert)
      )
    ).filter(Boolean) as BrickConf[];

    if (children.length > 0) {
      brick.children = [...(brick.children ?? []), ...children];
    }

    return brick;
  };

  const context = [
    ...convertDataSourcesToContext(view.dataSources ?? []),
    ...convertVariablesToContext(view.variables ?? []),
    {
      name: "__builtin_fn_getLatestMetricValue",
      value: function getLatestMetricValue(
        data: {
          list?: Record<string, any>[];
        },
        {
          metric,
          precision,
        }: { metric: { id: string; unit: string }; precision?: number }
      ) {
        const value = data?.list?.findLast?.(
          (item) => item[metric.id] != null
        )?.[metric.id];
        const unit = metric.unit === "load" ? "" : metric.unit;
        return pipes.unitFormat(value, unit, precision).join("");
      },
    },
    {
      name: "SIZE",
      value: options.expanded ? "medium" : "small",
    },
  ];

  const children = (await Promise.all(rootComponents.map(convert))).filter(
    Boolean
  ) as BrickConf[];

  const needBox = rootComponents.every((component) =>
    ["form", "descriptions", "button"].includes(component.componentName)
  );

  return {
    brick: "eo-content-layout",
    children: needBox ? [withBox(children, options)] : children,
    context,
  };
}

function convertDataSourcesToContext(dataSources: DataSource[]): ContextConf[] {
  return dataSources.map((dataSource) => ({
    name: dataSource.name,
    resolve: {
      useProvider: `${dataSource.api.name}:${dataSource.api.version}`,
      params: dataSource.params,
      ...(dataSource.transform
        ? { transform: { value: dataSource.transform } }
        : null),
    },
    track: true,
  }));
}

function convertVariablesToContext(variables: Variable[]): ContextConf[] {
  return variables.map(({ name, value }) => ({
    name,
    value,
  }));
}
