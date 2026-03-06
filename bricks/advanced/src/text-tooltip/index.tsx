import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import styleText from "./styles.shadow.css";
import { Tooltip, ConfigProvider } from "antd";
import {
  StyleProvider,
  createCache,
  legacyLogicalPropertiesTransformer,
} from "@ant-design/cssinjs";

const { defineElement, property } = createDecorators();

/**
 * 文本超出显示区域时，鼠标悬浮显示完整内容的 Tooltip
 * @author developer
 * @category display
 */
export
@defineElement("eo-text-tooltip", {
  styleTexts: [styleText],
})
class EoTextTooltip extends ReactNextElement implements EoTextTooltipProps {
  /**
   * 显示的文本内容，超出时以省略号截断
   * @default
   */
  @property({ type: String })
  accessor label: string | undefined;

  /**
   * 省略的行数，超过该行数后显示省略号，设为 0 表示不省略
   * @default 1
   */
  @property({ type: Number })
  accessor lineClamp: number = 1;

  render() {
    return (
      <EoTextTooltipComponent label={this.label} lineClamp={this.lineClamp} />
    );
  }
}

export interface EoTextTooltipProps {
  label?: string;
  lineClamp?: number;
}

export function EoTextTooltipComponent(props: EoTextTooltipProps) {
  const { lineClamp, label } = props;
  const ref = useRef<HTMLDivElement>(null);
  // 是否显示tooltip
  const [show, setShow] = useState(false);
  // 判断是否需要显示省略号
  const isEllipsis = useCallback(() => {
    const parentDom = ref.current;
    /* istanbul ignore if */
    if (!parentDom) return false;
    const { offsetWidth, offsetHeight, scrollWidth, scrollHeight } = parentDom;
    return offsetWidth < scrollWidth || offsetHeight < scrollHeight;
  }, [lineClamp, label]);

  const cache = useMemo(() => {
    return createCache();
  }, []);

  useEffect(() => {
    setShow(isEllipsis());
  }, [isEllipsis]);
  return (
    <ConfigProvider prefixCls="antdV5">
      <StyleProvider
        cache={cache}
        hashPriority="high"
        transformers={[legacyLogicalPropertiesTransformer]}
      >
        <Tooltip
          title={
            /* istanbul ignore next */
            show ? label : null
          }
        >
          <div
            ref={ref}
            className="ellipsisWrap"
            style={
              {
                "--line-clamp": lineClamp,
              } as React.CSSProperties
            }
          >
            {label}
          </div>
        </Tooltip>
      </StyleProvider>
    </ConfigProvider>
  );
}
