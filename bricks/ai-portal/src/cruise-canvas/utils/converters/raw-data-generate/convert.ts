import type { BrickConf } from "@next-core/types";
import _ from "lodash";
import type { VisualConfig, VisualStyle } from "./raw-data-interfaces.js";
import { getMemberAccessor } from "./getMemberAccessor.js";
import type { ConvertBrickOptions } from "../interfaces.js";

const { pick } = _;

export function convertToStoryboard(
  config: VisualConfig,
  attr: string,
  options?: ConvertBrickOptions
): BrickConf | null {
  return lowLevelConvertToStoryboard(config, getMemberAccessor(attr), options);
}

export function lowLevelConvertToStoryboard(
  config: VisualConfig,
  attrAccessor: string,
  options?: ConvertBrickOptions
): BrickConf | null {
  let brickItem: BrickConf;

  switch (config.display) {
    case "link":
    case "text": {
      brickItem = getPlainBrick(config, attrAccessor, options);
      if (config.type === "struct-list" && !config.countOnly) {
        brickItem = {
          brick: "eo-tag",
          // errorBoundary: true,
          children: [brickItem],
        };
      } else if (config.display === "link") {
        brickItem = {
          brick: "eo-link",
          // errorBoundary: true,
          children: [brickItem],
        };
      }
      break;
    }
    case "tag": {
      const colorSuffix =
        config.style?.variant === "background" ? "-inverse" : "";
      const valueAccessor = getValueAccessor(config, attrAccessor);
      brickItem = {
        brick: "eo-tag",
        // errorBoundary: true,
        properties: {
          textContent: `<% ${valueAccessor} %>`,
          size: getTagSize(config.style?.size),
          color: config.style?.background
            ? `${config.style.background}${colorSuffix}`
            : config.style?.palette
              ? `<%
  \`\${new Map(Object.entries(${JSON.stringify(
    config.style.palette,
    null,
    2
  ).replaceAll("\n", "\n  ")})).get(${valueAccessor}) ?? "gray"}${colorSuffix}\`
%>`
              : `gray${colorSuffix}`,
          outline: config.style?.variant === "outline",
        },
      };
      break;
    }
    case "icon": {
      brickItem = getIconBrick(config, attrAccessor, options);
      break;
    }
    case "icon+text": {
      const iconBrick = getIconBrick(config, attrAccessor, options);
      const textBrick = getPlainBrick(config, attrAccessor, options);
      brickItem = {
        brick: "span",
        // errorBoundary: true,
        properties: {
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5em",
          },
        },
        children: [iconBrick, textBrick],
      };
      break;
    }
    default:
      return null;
  }

  if (config.type !== "struct-list" || config.countOnly) {
    return brickItem;
  }

  const maxItems = Number(config.maxItems) || 3;
  return {
    brick: "span",
    // errorBoundary: true,
    properties: {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5em",
      },
    },
    children: [
      {
        brick: ":forEach",
        dataSource: `<% DATA${attrAccessor}.slice(0, ${maxItems}) %>`,
        children: [brickItem],
      },
      {
        brick: "eo-link",
        if: `<% DATA${attrAccessor}.length > ${maxItems} %>`,
        properties: {
          textContent: `<% \`+ \${DATA${attrAccessor}.length - ${maxItems}}\` %>`,
        },
      },
    ],
  };
}

function getIconBrick(
  config: VisualConfig,
  attrAccessor: string,
  options?: ConvertBrickOptions
): BrickConf {
  if (config.type === "boolean") {
    const valueAccessor = getValueAccessor(config, attrAccessor);
    const trueIcon = config.true?.icon ?? "check";
    const falseIcon = config.false?.icon ?? "xmark";
    const trueStyle = getPlainStyle(config.true?.style, options);
    const falseStyle = getPlainStyle(config.false?.style, options);
    return {
      brick: "eo-icon",
      // errorBoundary: true,
      properties: {
        lib: "fa",
        prefix: "fas",
        icon: `<% ${valueAccessor} ? ${JSON.stringify(trueIcon)} : ${JSON.stringify(falseIcon)} %>`,
        style: `<% ${valueAccessor} ? ${JSON.stringify(trueStyle)} : ${JSON.stringify(falseStyle)} %>`,
      },
    };
  }

  if (config.type === "json") {
    const valueAccessor = getValueAccessor(config, attrAccessor);
    return {
      brick: "eo-icon",
      // errorBoundary: true,
      properties: {
        lib: `<% ${valueAccessor}?.lib %>`,
        prefix: `<% ${valueAccessor}?.prefix %>`,
        category: `<% ${valueAccessor}?.category %>`,
        theme: `<% ${valueAccessor}?.theme %>`,
        icon: `<% ${valueAccessor}?.icon %>`,
        style: getPlainStyle(config.style, options),
      },
    };
  }

  return {
    brick: "eo-icon",
    // errorBoundary: true,
    properties: {
      lib: "fa",
      prefix: "fas",
      icon: config.icon,
      style: getPlainStyle(config.style, options),
    },
  };
}

function getPlainBrick(
  config: VisualConfig,
  attrAccessor: string,
  options?: ConvertBrickOptions
): BrickConf {
  if (config.type === "struct-list" && config.countOnly) {
    return {
      brick: "span",
      properties: {
        textContent: `<% \`\${DATA${attrAccessor}.length}\` %>`,
      },
    };
  }

  const valueAccessor = getValueAccessor(config, attrAccessor);
  const value = `<% ${valueAccessor} %>`;
  switch (config.formatter?.type) {
    case "number":
      return {
        brick: "eo-formatter-number",
        // errorBoundary: true,
        properties: {
          value,
          type: config.formatter.format,
          ...pick(config.formatter, [
            "currency",
            // "unit",
            "originalUnit",
            "decimals",
            "thousandsSeparator",
          ]),
          style: getPlainStyle(config.style, options),
        },
      };
    case "date":
    case "date-time":
      return {
        brick: "eo-humanize-time",
        // errorBoundary: true,
        properties: {
          value,
          type: config.type === "date" ? "date" : undefined,
          formatter: config.formatter.format,
          style: getPlainStyle(config.style, options),
        },
      };
    case "cost-time":
      return {
        brick: "eo-humanize-time",
        // errorBoundary: true,
        properties: {
          value,
          isCostTime: true,
          style: getPlainStyle(config.style, options),
        },
      };
    default: {
      let textContent: string | undefined;
      let style: Record<string, any> | string | undefined;
      let tag = "span";
      if (config.type === "boolean") {
        const trueContent = config.true?.text ?? "Yes";
        const falseContent = config.false?.text ?? "No";
        const trueStyle = getPlainStyle(config.true?.style, options);
        const falseStyle = getPlainStyle(config.false?.style, options);
        textContent = `<% ${valueAccessor} ? ${JSON.stringify(trueContent)} : ${JSON.stringify(falseContent)} %>`;
        style = `<% ${valueAccessor} ? ${JSON.stringify(trueStyle)} : ${JSON.stringify(falseStyle)} %>`;
      } else {
        style = getPlainStyle(config.style, options);
        if (config.type === "json") {
          if (config.display === "link") {
            textContent = `<% I18N("VIEW", "查看") %>`;
          } else {
            tag = "pre";
            textContent = `<% PIPES.jsonStringify(${valueAccessor}) %>`;
          }
        } else {
          textContent = value;
        }
      }
      return {
        brick: tag,
        // errorBoundary: true,
        properties: {
          textContent,
          style,
        },
      };
    }
  }
}

function getValueAccessor(config: VisualConfig, attrAccessor: string): string {
  if (
    (config.type === "struct" || config.type === "struct-list") &&
    config.field
  ) {
    return `${config.type === "struct" ? `DATA${attrAccessor}` : "ITEM"}${getMemberAccessor(config.field)}`;
  }
  return `DATA${attrAccessor}`;
}

function getTagSize(size: VisualStyle["size"]): string | undefined {
  switch (size) {
    case "large":
    case "medium":
    case "small":
      return size;
    case "x-large":
      return "large";
    // case "x-small":
    //   return "xs";
  }
}

function getPlainStyle(
  configStyle: VisualStyle | undefined,
  options?: ConvertBrickOptions
): Record<string, any> | undefined {
  if (!configStyle || options?.ignoreStyle) {
    return;
  }
  const style: Record<string, any> = {};
  switch (configStyle.size) {
    // case "x-small":
    case "small":
      style.fontSize = "var(--sub-title-font-size-small)";
      break;
    case "medium":
      style.fontSize = "var(--normal-font-size)";
      break;
    case "large":
      style.fontSize = "var(--card-title-font-size)";
      break;
    case "x-large":
      style.fontSize = "var(--title-font-size-larger)";
      break;
  }
  switch (configStyle.fontWeight) {
    case "bold":
    case "normal":
      style.fontWeight = configStyle.fontWeight;
  }
  if (configStyle.color) {
    style.color = configStyle.color;
  }
  return style;
}
