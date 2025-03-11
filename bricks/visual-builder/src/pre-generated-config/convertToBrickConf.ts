import type { BrickConf, SlotConfOfBricks, SlotsConf } from "@next-core/types";
import { hasOwnProperty } from "@next-core/utils/general";
import type {
  ChartConfig,
  Config,
  ContainerConfig,
  DefaultConfig,
  GroupedChartConfig,
} from "./index.js";
import { getMemberAccessor } from "../shared/getMemberAccessor.js";
import {
  convertToStoryboard,
  lowLevelConvertToStoryboard,
} from "../raw-data-preview/convert.js";
import { has } from "lodash";
import { convertToChart } from "../raw-metric-preview/convert.js";

export function convertToBrickConf(
  configList: Config[],
  { type, dataName, dataType, settings }: ContainerConfig
): BrickConf | null {
  if (!type || !dataName || configList.length === 0) {
    return null;
  }

  const dataAccessor = dataType === "state" ? "STATE" : "CTX";
  const valueAccessor = `${dataAccessor}${getMemberAccessor(dataName)}`;

  if (type === "chart") {
    const metricConfigList = configList as (ChartConfig | GroupedChartConfig)[];
    const dataSource = `<%= ${valueAccessor}${settings?.pagination ? ".list" : ""} %>`;

    const charts = metricConfigList.map(({ candidate, meta }) =>
      convertToChart(
        {
          ...candidate,
          min: meta.counterMetricKey ? undefined : candidate.min,
        },
        dataSource,
        meta.metric.metricKey,
        {
          unit: meta.metric.unit,
        },
        meta.groupedMetricKeys,
        meta.counterMetricKey
      )
    );

    if (charts.length === 1) {
      return charts[0];
    }

    return {
      brick: "eo-grid-layout",
      properties: {
        templateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
        gap: "var(--card-content-gap)",
      },
      slots: {
        "": {
          type: "bricks",
          bricks: charts,
        },
      },
    };
  }

  const attrConfigList = configList as DefaultConfig[];

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
  for (const config of attrConfigList) {
    if (config.candidate) {
      const brick =
        type === "table"
          ? lowLevelConvertToStoryboard(config.candidate, ".cellData")
          : convertToStoryboard(config.candidate, config.meta.attr.id);
      if (brick) {
        brickMap.set(config.meta.attr.id, getCompatibleBrickConf(brick));
      }
    }
  }
  const slots = Object.fromEntries(
    attrConfigList
      .map((config) => {
        const brick = brickMap.get(config.meta.attr.id);
        return brick
          ? [
              `[${config.meta.attr.id}]`,
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
          columns: attrConfigList.map(({ meta: { attr } }) => {
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
          list: attrConfigList.map(({ candidate, meta: { attr } }) => {
            const item: Record<string, unknown> = {
              label: attr.name,
            };
            if (candidate) {
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
