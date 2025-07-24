import React, { Suspense, useEffect, useMemo, useState } from "react";
import { upperFirst } from "lodash";
import { UseBrickConf } from "@next-core/types";
import { hasOwnProperty, isObject } from "@next-core/utils/general";
import type { CmdbInstanceDetailData } from "../interfaces";
import { AsyncWrappedDescriptions } from "../bricks";
import { getPreGeneratedAttrViews } from "../utils/converters/getPreGeneratedAttrViews";
import { convertToStoryboard } from "../utils/converters/raw-data-generate/convert";
import type { JSONSchema } from "../json-schema";
import styleText from "./detail.shadow.css";

/**
 * 如果属性数量超过阈值，则使用两列布局
 */
const LIST_SPLIT_THRESHOLD = 6;

/**
 * 如果表格列数超过阈值，则让表格跨两列显示
 */
const TABLE_SPAN_THRESHOLD = 2;

export function CmdbInstanceDetail({
  objectId,
  detail,
  outputSchema,
}: CmdbInstanceDetailData) {
  const [attrViews, setAttrViews] = useState<Map<string, any> | undefined>();

  useEffect(() => {
    let ignore = false;
    (async () => {
      const attrViews = await getPreGeneratedAttrViews(objectId, 1);
      if (!ignore) {
        setAttrViews(attrViews);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [objectId]);

  const list = useMemo(() => {
    if (outputSchema?.type === "object") {
      const entries = Object.entries<JSONSchema>(outputSchema.properties);
      return entries.map(([key, def]) => {
        const { description, type } = def;
        const label = description || upperFirst(key);

        if (isEmptyValue(detail, key)) {
          return {
            label,
            text: "",
          };
        }

        if (type === "array" && Array.isArray(detail[key])) {
          const { items } = def;
          if (items?.type === "object") {
            const props = Object.entries(items.properties);
            return {
              label,
              gridColumn:
                entries.length > LIST_SPLIT_THRESHOLD &&
                props.length > TABLE_SPAN_THRESHOLD
                  ? "1 / span 2"
                  : undefined,
              useBrick: {
                brick: "div",
                children: [
                  {
                    brick: "style",
                    properties: {
                      textContent: styleText,
                    },
                  },
                  {
                    brick: "table",
                    children: [
                      {
                        brick: "thead",
                        children: [
                          {
                            brick: "tr",
                            children: props.map(([k, v]) => ({
                              brick: "th",
                              properties: {
                                textContent: v.description || upperFirst(k),
                              },
                            })),
                          },
                        ],
                      },
                      {
                        brick: "tbody",
                        children: detail[key].map(
                          (value: Record<string, any>) => ({
                            brick: "tr",
                            children: props.map(([k, v]) => ({
                              brick: "td",
                              properties: {
                                textContent: isEmptyValue(value, k)
                                  ? ""
                                  : isComplexType(v.type)
                                    ? JSON.stringify(value[k], null, 2)
                                    : String(value[k]),
                              },
                            })),
                          })
                        ),
                      },
                    ],
                  },
                ],
              },
            };
          }

          if (!isComplexType(items?.type)) {
            return {
              label,
              text: detail[key].join(", "),
            };
          }
        }

        if (type === "object" && isObject(detail[key])) {
          const props = Object.entries(def.properties);
          return {
            label,
            gridColumn:
              entries.length > LIST_SPLIT_THRESHOLD &&
              props.length > TABLE_SPAN_THRESHOLD
                ? "1 / span 2"
                : undefined,
            useBrick: {
              brick: "div",
              children: [
                {
                  brick: "style",
                  properties: {
                    textContent: styleText,
                  },
                },
                {
                  brick: "table",
                  children: [
                    {
                      brick: "thead",
                      children: [
                        {
                          brick: "tr",
                          children: props.map(([k, v]) => ({
                            brick: "th",
                            properties: {
                              textContent: v.description || upperFirst(k),
                            },
                          })),
                        },
                      ],
                    },
                    {
                      brick: "tbody",
                      children: [
                        {
                          brick: "tr",
                          children: props.map(([k, v]) => ({
                            brick: "td",
                            properties: {
                              textContent: isEmptyValue(detail[key], k)
                                ? ""
                                : isComplexType(v.type)
                                  ? JSON.stringify(detail[key][k], null, 2)
                                  : String(detail[key][k]),
                            },
                          })),
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          };
        }

        if (isComplexType(type)) {
          return {
            label,
            text: JSON.stringify(detail[key], null, 2),
          };
        }

        const candidate = attrViews?.get(key);
        if (candidate) {
          const brick = convertToStoryboard(candidate, key, {
            ignoreStyle: true,
          });
          if (brick) {
            return {
              label,
              useBrick: brick as UseBrickConf,
            };
          }
        }

        return {
          label,
          field: key,
        };
      });
    }
    return Object.keys(detail).map((key) => ({
      label: upperFirst(key),
      field: key,
    }));
  }, [attrViews, detail, outputSchema]);

  if (!attrViews) {
    return null;
  }

  return (
    <Suspense>
      <div
        style={{
          background: "var(--elevo-component-background)",
          backdropFilter: "var(--elevo-component-backdrop-filter)",
          borderRadius: "var(--elevo-border-radius)",
          padding: "16px",
        }}
      >
        <AsyncWrappedDescriptions
          themeVariant="elevo"
          column={list.length > LIST_SPLIT_THRESHOLD ? 2 : 1}
          dataSource={detail}
          list={list}
        />
      </div>
    </Suspense>
  );
}

function isComplexType(type: JSONSchema["type"] | undefined): boolean {
  return !type || type === "object" || type === "array";
}

function isEmptyValue(detail: Record<string, any>, key: string) {
  return (
    !hasOwnProperty(detail, key) ||
    detail[key] == null ||
    detail[key] == "" ||
    (Array.isArray(detail[key]) && detail[key].length === 0)
  );
}
