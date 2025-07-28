import React, { useEffect, useMemo, useRef, useState } from "react";
import { uniqueId, upperFirst } from "lodash";
import { unstable_createRoot } from "@next-core/runtime";
import {
  UseBrickConf,
  type BrickConf,
  type BrickEventHandler,
  type ContextConf,
  type UseSingleBrickConf,
} from "@next-core/types";
import { hasOwnProperty, isObject } from "@next-core/utils/general";
import type { DescriptionItem } from "@next-bricks/presentational/descriptions";
import type { CmdbInstanceDetailData } from "../interfaces";
import { getPreGeneratedAttrViews } from "../utils/converters/getPreGeneratedAttrViews";
import { convertToStoryboard } from "../utils/converters/raw-data-generate/convert";
import type { JSONSchema, JSONSchemaObject } from "../json-schema";
import styles from "./CmdbInstanceDetail.module.css";
import { createPortal } from "../utils/createPortal";
import { WrappedIcon } from "../bricks";
import { ICON_LOADING } from "../constants";

/**
 * 如果属性数量超过阈值，则使用两列布局
 */
const LIST_SPLIT_THRESHOLD = 6;

/**
 * 如果条目数量超过阈值，则使用表格显示
 */
const SHOW_AS_TABLE_THRESHOLD = 2;

const BUILTIN_FN_STRINGIFY = "__builtin_fn_stringify";

export function CmdbInstanceDetail({
  objectId,
  detail,
  outputSchema,
}: CmdbInstanceDetailData) {
  const rootId = useMemo(() => uniqueId(), []);
  const ref = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) {
      return;
    }
    const portal = createPortal(rootId);
    const root = unstable_createRoot(container, {
      portal,
      supportsUseChildren: true,
    } as any);
    rootRef.current = root;

    return () => {
      root.unmount();
      portal.remove();
      rootRef.current = null;
    };
  }, [rootId]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const { bricks, context } = await convertCmdbInstanceDetail(
          detail,
          objectId,
          outputSchema,
          rootId
        );
        if (ignore) {
          return;
        }
        await rootRef.current?.render(bricks, { context });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to render view:", error);
      }
      if (!ignore) {
        setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [detail, objectId, outputSchema, rootId]);

  return (
    <div className={styles.container}>
      {loading && <WrappedIcon className={styles.loading} {...ICON_LOADING} />}
      <div data-root-id={rootId} ref={ref} />
    </div>
  );
}

function isComplexType(type: JSONSchema["type"] | undefined): boolean {
  return !type || type === "object" || type === "array";
}

function isEmptyValue(detail: Record<string, any>, key: string) {
  return (
    !hasOwnProperty(detail, key) ||
    detail[key] == null ||
    detail[key] === "" ||
    (Array.isArray(detail[key]) && detail[key].length === 0)
  );
}

async function convertCmdbInstanceDetail(
  detail: Record<string, any>,
  objectId: string,
  outputSchema: JSONSchema | string | undefined,
  rootId: string
): Promise<{ bricks: BrickConf[]; context: ContextConf[] }> {
  const attrViews = await getPreGeneratedAttrViews(objectId, 1);

  let schema: JSONSchema | undefined;
  if (typeof outputSchema === "string") {
    try {
      schema = JSON.parse(outputSchema) as JSONSchema;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to parse outputSchema as JSON", e);
    }
  } else {
    schema = outputSchema;
  }

  let list: DescriptionItem[];
  const modals: BrickConf[] = [];
  const context: ContextConf[] = [
    {
      name: BUILTIN_FN_STRINGIFY,
      value: builtinFnStringify,
    },
  ];

  function convertArrayOfObjects(
    valueAccessor: string,
    schema: JSONSchemaObject,
    label: string,
    idPrefix: string,
    needContext?: boolean
  ): UseSingleBrickConf {
    const props = Object.entries(schema.properties);
    const key = props.length > 0 ? props[0][0] : null;
    const modalId = normalizeIdentifier(`modal__${idPrefix}`);
    const contextId = normalizeIdentifier(`context__${idPrefix}`);
    if (needContext) {
      context.push({
        name: contextId,
      });
    }

    const modal: BrickConf = {
      brick: "eo-modal",
      portal: true,
      properties: {
        dataset: {
          modalId,
        },
        width: "800px",
        themeVariant: "elevo",
        modalTitle: label,
        hideCancelButton: true,
        maskClosable: true,
        keyboard: true,
      },
    };

    modals.push(modal);

    const columns: {
      key: string;
      dataIndex: string;
      title: string;
      useChildren?: string;
    }[] = [];
    const tableChildren: UseSingleBrickConf[] = [];

    for (const [k, v] of props) {
      let useChildren: string | undefined;
      if (v.type === "array" && v.items.type === "object") {
        useChildren = `[${k}]`;
        tableChildren.push({
          ...convertArrayOfObjects(
            "DATA.cellData",
            v.items,
            v.description || upperFirst(k),
            `${idPrefix}__${k}`,
            true
          ),
          slot: useChildren,
        });
      } else if (v.type === "object") {
        useChildren = `[${k}]`;
        tableChildren.push({
          ...convertObject(
            "DATA.cellData",
            v,
            v.description || upperFirst(k),
            `${idPrefix}__${k}`,
            true
          ),
          slot: useChildren,
        });
      }

      columns.push({
        key: k,
        dataIndex: k,
        title: v.description || upperFirst(k),
        useChildren,
      });
    }

    modal.children = [
      {
        brick: "eo-next-table",
        properties: {
          dataSource: needContext
            ? `<%= { list: CTX.${contextId} } %>`
            : `<% { list: (${valueAccessor}) } %>`,
          columns,
          themeVariant: "elevo",
          pagination: false,
          bordered: true,
        },
        children: tableChildren,
      },
    ];

    const clickHandler: BrickEventHandler[] = [
      ...((needContext
        ? [
            {
              action: "context.replace",
              args: [
                {
                  name: contextId,
                  value: `<% ${valueAccessor} %>`,
                },
              ],
            },
          ]
        : []) as BrickEventHandler[]),
      {
        target: `[data-root-id="${rootId}"] [data-modal-id="${modalId}"]`,
        method: "open",
      },
    ];

    return {
      brick: "span",
      if: `<% !!(${valueAccessor}) %>`,
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
          dataSource: `<% (${valueAccessor}).slice(0, ${SHOW_AS_TABLE_THRESHOLD}) %>`,
          children: [
            {
              brick: "eo-tag",
              properties: {
                textContent: `<% CTX.${BUILTIN_FN_STRINGIFY}(ITEM, ${JSON.stringify(key)}, ${JSON.stringify(props[0]?.[1].type)}) %>`,
                outline: true,
                style: {
                  cursor: "pointer",
                },
              },
              events: {
                click: clickHandler,
              },
            },
          ],
        },
        {
          brick: "eo-link",
          if: `<% (${valueAccessor}).length > ${SHOW_AS_TABLE_THRESHOLD} %>`,
          properties: {
            textContent: `<% \`+\${(${valueAccessor}).length - ${SHOW_AS_TABLE_THRESHOLD}}\` %>`,
          },
          events: {
            click: clickHandler,
          },
        },
      ],
    };
  }

  function convertObject(
    valueAccessor: string,
    schema: JSONSchemaObject,
    label: string,
    idPrefix: string,
    needContext?: boolean
  ): UseSingleBrickConf {
    const props = Object.entries(schema.properties);
    const key = props.length > 0 ? props[0][0] : null;
    const modalId = normalizeIdentifier(`modal__${idPrefix}`);
    const contextId = normalizeIdentifier(`context__${idPrefix}`);
    if (needContext) {
      context.push({
        name: contextId,
      });
    }

    modals.push({
      brick: "eo-modal",
      portal: true,
      properties: {
        dataset: {
          modalId,
        },
        themeVariant: "elevo",
        modalTitle: label,
        hideCancelButton: true,
        maskClosable: true,
        keyboard: true,
      },
      children: [
        {
          brick: "eo-descriptions",
          properties: {
            themeVariant: "elevo",
            column: 1,
            dataSource: needContext
              ? `<%= CTX.${contextId} %>`
              : `<% ${valueAccessor} %> `,
            list: props.map(([k, v]) => ({
              label: v.description || upperFirst(k),
              field: k,
            })),
          },
        },
      ],
    });

    return {
      brick: "span",
      if: `<% !!(${valueAccessor}) %>`,
      properties: {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5em",
        },
      },
      children: [
        {
          brick: "eo-tag",
          properties: {
            textContent: `<% CTX.${BUILTIN_FN_STRINGIFY}(${valueAccessor}, ${JSON.stringify(key)}, ${JSON.stringify(props[0]?.[1].type)}) %>`,
            outline: true,
            style: {
              cursor: "pointer",
            },
          },
          events: {
            click: [
              ...((needContext
                ? [
                    {
                      action: "context.replace",
                      args: [
                        {
                          name: contextId,
                          value: `<% ${valueAccessor} %>`,
                        },
                      ],
                    },
                  ]
                : []) as BrickEventHandler[]),
              {
                target: `[data-root-id="${rootId}"] [data-modal-id="${modalId}"]`,
                method: "open",
              },
            ],
          },
        },
      ],
    };
  }

  if (schema?.type === "object") {
    const entries = Object.entries<JSONSchema>(schema.properties);
    list = entries.map<DescriptionItem>(([key, def]) => {
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
          const contextName = normalizeIdentifier(`context__${key}`);
          context.push({
            name: contextName,
            value: detail[key],
          });

          return {
            label,
            useBrick: convertArrayOfObjects(
              `CTX.${contextName}`,
              items,
              label,
              key
            ),
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
        const contextName = normalizeIdentifier(`context__${key}`);
        context.push({
          name: contextName,
          value: detail[key],
        });

        return {
          label,
          useBrick: convertObject(`CTX.${contextName}`, def, label, key),
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
  } else {
    list = Object.keys(detail).map((key) => ({
      label: upperFirst(key),
      field: key,
    }));
  }

  return {
    bricks: [
      {
        brick: "eo-descriptions",
        properties: {
          themeVariant: "elevo",
          column: list.length > LIST_SPLIT_THRESHOLD ? 2 : 1,
          dataSource: detail,
          list,
        },
      },
      ...modals,
    ],
    context,
  };
}

function normalizeIdentifier(identifier: string): string {
  return identifier.replace(/[^a-zA-Z0-9_]+/g, "_");
}

function builtinFnStringify(
  value: Record<string, unknown>,
  key: string | null,
  type: JSONSchema["type"] | undefined
): string {
  if (key === null || isEmptyValue(value, key)) {
    return "";
  }
  const v = value[key];
  if (isComplexType(type) && isObject(v)) {
    return JSON.stringify(v, null, 2);
  }
  return String(v);
}
