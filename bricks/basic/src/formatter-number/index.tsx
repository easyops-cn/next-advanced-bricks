import React, { useMemo } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { pipes } from "@next-core/pipes";
import "@next-core/theme";
import styleText from "./styles.shadow.css";

const { defineElement, property } = createDecorators();

export interface EoFormatterNumberProps {
  value?: number;
  type?: NumberType;
  currency?: string;
  unit?: string;
  originalUnit?: string;
  decimals?: number;
  thousandsSeparators?: boolean;
  fallback?: string;
}

export type NumberType = "decimal" | "currency" | "percent" | "unit";

export type NumberOriginalUnit =
  // Decimal bytes
  | "bytes"
  | "B"
  | "KB"
  | "MB"
  | "GB"
  | "TB"
  | "PB"
  // Binary bytes
  | "bibytes"
  | "KiB"
  | "MiB"
  | "GiB"
  | "TiB"
  | "PiB";

/**
 * 数字格式化构件
 */
export
@defineElement("eo-formatter-number", {
  styleTexts: [styleText],
})
class EoFormatterNumber
  extends ReactNextElement
  implements EoFormatterNumberProps
{
  @property({ type: Number })
  accessor value: number | undefined;

  /**
   * @default "decimal"
   */
  @property()
  accessor type: NumberType | undefined;

  /**
   * @default "CNY"
   */
  @property()
  accessor currency: string | undefined;

  @property()
  accessor unit: string | undefined;

  @property()
  accessor originalUnit: NumberOriginalUnit | undefined;

  /**
   * 保留的小数位数
   */
  @property({ type: Number })
  accessor decimals: number | undefined;

  /**
   * 是否启用千分位分隔符
   *
   * @default true
   */
  @property({ type: Boolean })
  accessor thousandsSeparators: boolean | undefined;

  /**
   * 当 value 为空或不是数字时的显示内容
   */
  @property()
  accessor fallback: string | undefined;

  render() {
    return (
      <EoFormatterNumberComponent
        value={this.value}
        type={this.type}
        currency={this.currency}
        unit={this.unit}
        originalUnit={this.originalUnit}
        decimals={this.decimals}
        thousandsSeparators={this.thousandsSeparators}
        fallback={this.fallback}
      />
    );
  }
}

export function EoFormatterNumberComponent({
  value,
  type,
  currency,
  unit,
  originalUnit,
  decimals,
  thousandsSeparators,
  fallback,
}: EoFormatterNumberProps) {
  const formattedValue = useMemo(() => {
    if (typeof value !== "number") {
      return fallback;
    }

    if (type === "unit" && originalUnit) {
      return pipes.unitFormat(value, originalUnit, decimals ?? 0).join(" ");
    }

    const formatter = new Intl.NumberFormat("zh-CN", {
      style: type ?? "decimal",
      currency: type === "currency" ? currency ?? "CNY" : undefined,
      unit,
      minimumFractionDigits: decimals ?? 0,
      maximumFractionDigits: decimals ?? 20,
      useGrouping: thousandsSeparators,
    });
    return formatter.format(value);
  }, [
    currency,
    decimals,
    fallback,
    originalUnit,
    thousandsSeparators,
    type,
    unit,
    value,
  ]);

  return <span>{formattedValue}</span>;
}