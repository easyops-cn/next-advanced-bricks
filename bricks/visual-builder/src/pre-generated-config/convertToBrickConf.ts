import type { BrickConf, SlotConfOfBricks, SlotsConf } from "@next-core/types";
import { hasOwnProperty } from "@next-core/utils/general";
import type { AttrConfig, ContainerConfig } from "./index.js";
import { getMemberAccessor } from "../shared/getMemberAccessor.js";
import {
  convertToStoryboard,
  lowLevelConvertToStoryboard,
} from "../raw-data-preview/convert.js";
import { has } from "lodash";

export function convertToBrickConf(
  attrList: AttrConfig[],
  { type, dataName, dataType, settings }: ContainerConfig
): BrickConf | null {
  if (!type || !dataName) {
    return null;
  }

  const dataAccessor = dataType === "state" ? "STATE" : "CTX";
  const valueAccessor = `${dataAccessor}${getMemberAccessor(dataName)}`;

  if (type === "chart") {
    const dataSource = `<%= ${valueAccessor}${settings?.pagination ? ".list" : ""} %>`;

    return {
      brick: "eo-mini-line-chart",
      properties: {
        width: 600,
        height: 200,
        xField: settings.fields?.xField,
        yField: settings.fields?.yField,
        lineColor: "var(--palette-orange-6)",
        data: dataSource,
      },
    };
  }

  if (type === "cards") {
    const dataSource = `<%= ${valueAccessor}${settings?.pagination ? ".list" : ""} %>`;

    return {
      brick: "eo-grid-layout",
      properties: {
        templateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "var(--card-content-gap)",
      },
      slots: {
        "": {
          type: "bricks",
          bricks: [
            {
              brick: ":forEach",
              dataSource,
              slots: {
                "": {
                  type: "bricks",
                  bricks: [
                    {
                      brick: "eo-card-item",
                      properties: {
                        cardTitle:
                          has(settings?.fields, "title") &&
                          typeof settings.fields.title === "string"
                            ? `<% ITEM${getMemberAccessor(settings.fields.title)} %>`
                            : undefined,
                        description:
                          has(settings?.fields, "description") &&
                          typeof settings.fields.description === "string"
                            ? `<% ITEM${getMemberAccessor(settings.fields.description)} %>`
                            : undefined,
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    };
  }

  const dataSource = `<%= ${
    settings?.pagination
      ? settings?.fields?.pageSize
        ? `{...${valueAccessor},pageSize: ${valueAccessor}${getMemberAccessor(settings.fields.pageSize)}}`
        : valueAccessor
      : `{ list: ${valueAccessor} }`
  } %>`;

  const brickMap = new Map<string, BrickConf>();
  for (const attr of attrList) {
    if (attr.config) {
      const brick =
        type === "table"
          ? lowLevelConvertToStoryboard(attr.config, ".cellData")
          : convertToStoryboard(attr.config, attr.id);
      if (brick) {
        brickMap.set(attr.id, getCompatibleBrickConf(brick));
      }
    }
  }
  const slots = Object.fromEntries(
    attrList
      .map((attr) => {
        const brick = brickMap.get(attr.id);
        return brick
          ? [
              `[${attr.id}]`,
              {
                type: "bricks",
                bricks: [brick],
              },
            ]
          : null;
      })
      .filter(Boolean)
  );

  switch (type) {
    case "table":
      return {
        brick: "eo-next-table",
        properties: {
          rowKey: "instanceId",
          columns: attrList.map((attr) => {
            const col: Record<string, unknown> = {
              title: attr.name,
              dataIndex: attr.id,
              key: attr.id,
            };
            if (brickMap.has(attr.id)) {
              col.useChildren = `[${attr.id}]`;
            }
            return col;
          }),
          dataSource,
          ...(settings?.pagination ? null : { pagination: false }),
        },
        slots,
      };
    case "descriptions":
      return {
        brick: "eo-descriptions",
        properties: {
          column: 2,
          list: attrList.map((attr) => {
            const item: Record<string, unknown> = {
              label: attr.name,
            };
            if (attr.config) {
              item.useChildren = `[${attr.id}]`;
            }
            return item;
          }),
          dataSource,
        },
        slots,
      };
  }

  return null;
}

function getCompatibleBrickConf(brick: BrickConf) {
  const { children, slots, ...rest } = brick;
  return {
    ...rest,
    slots: childrenToSlots(children, slots),
  };
}

function childrenToSlots(
  children: BrickConf[] | undefined,
  originalSlots: SlotsConf | undefined
) {
  let newSlots = originalSlots;
  if (Array.isArray(children) && !newSlots) {
    newSlots = {};
    for (const { slot: sl, ...child } of children) {
      const slot = sl ?? "";
      if (!hasOwnProperty(newSlots, slot)) {
        newSlots[slot] = {
          type: "bricks",
          bricks: [],
        };
      }
      (newSlots[slot] as SlotConfOfBricks).bricks.push(
        getCompatibleBrickConf(child)
      );
    }
  }
  return newSlots;
}
