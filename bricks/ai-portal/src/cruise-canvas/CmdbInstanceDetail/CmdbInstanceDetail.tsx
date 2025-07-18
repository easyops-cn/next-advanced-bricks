import React, { Suspense, useEffect, useMemo, useState } from "react";
import { upperFirst } from "lodash";
import { UseBrickConf } from "@next-core/types";
import { hasOwnProperty } from "@next-core/utils/general";
import type { CmdbInstanceDetailData } from "../interfaces";
import { AsyncWrappedDescriptions } from "../bricks";
import { getPreGeneratedAttrViews } from "../utils/converters/getPreGeneratedAttrViews";
import { convertToStoryboard } from "../utils/converters/raw-data-generate/convert";

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
    if (!attrViews) {
      return [];
    }
    if (outputSchema?.type === "object") {
      return Object.entries<{ type: string; description: string }>(
        outputSchema.properties
      ).map(([key, { description, type }]) => {
        const label = description || upperFirst(key);
        const isComplexType = !type || type === "object" || type === "array";

        if (isComplexType) {
          return {
            label,
            text:
              !hasOwnProperty(detail, key) ||
              detail[key] == null ||
              (type === "array" && detail[key].length === 0)
                ? ""
                : JSON.stringify(detail[key], null, 2),
          };
        }

        const candidate = attrViews.get(key);
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
          column={list.length > 6 ? 2 : 1}
          dataSource={detail}
          list={list}
        />
      </div>
    </Suspense>
  );
}
