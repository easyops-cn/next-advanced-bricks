import React, { useEffect, useMemo } from "react";
import { EventEmitter, createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import type { lockBodyScroll as _lockBodyScroll } from "@next-bricks/basic/data-providers/lock-body-scroll/lock-body-scroll";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import "@next-core/theme";
import styleText from "./styles.shadow.css";
import { unwrapProvider } from "@next-core/utils/general";
import classNames from "classnames";
import { useCurrentTheme } from "@next-core/react-runtime";
import StepImage from "./step.png";
import StepDarkImage from "./step-dark.png";

const { defineElement, property, event, method } = createDecorators();

const lockBodyScroll = unwrapProvider<typeof _lockBodyScroll>(
  "basic.lock-body-scroll"
);
const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export interface StepItem {
  title: string;
  key: string;
}

export interface EoLoadingStepEventsMap {
  open: CustomEvent<void>;
  close: CustomEvent<void>;
}

export interface EoLoadingStepEventsMapping {
  onOpen: "open";
  onClose: "close";
}

/**
 * @description 加载步骤框。以全屏遮罩的形式展示多步骤加载进度，适用于系统初始化、批量操作等需要阻塞用户交互的场景。
 */
export
@defineElement("eo-loading-step", {
  styleTexts: [styleText],
})
class EoLoadingStep extends ReactNextElement implements EoLoadingStepProps {
  /**
   * @description 是否可见。为 `true` 时展示全屏遮罩并锁定页面滚动，为 `false` 时隐藏遮罩并恢复滚动。
   */
  @property({
    type: Boolean,
  })
  accessor visible: boolean | undefined;

  /**
   * @description 容器宽度，支持任意 CSS 宽度值（如 `"400px"`、`"50%"`）。不设置时使用默认宽度。
   */
  @property()
  accessor width: string | undefined;

  /**
   * @description 步骤区域的标题文字，显示在步骤列表上方。
   */
  @property()
  accessor stepTitle: string | undefined;

  /**
   * @description 步骤列表，每项包含 `title`（显示名称）和 `key`（唯一标识）。步骤按数组顺序渲染。
   */
  @property({
    attribute: false,
  })
  accessor stepList: StepItem[] | undefined;

  /**
   * @description 当前正在执行的步骤 `key`。key 对应的步骤显示为加载中（loading），之前的步骤显示为已完成（finished），之后的步骤显示为待执行（pending）。
   */
  @property()
  accessor curStep: string | undefined;

  /**
   * @description 调用 `open()` 方法后触发。
   */
  @event({ type: "open" })
  accessor #openEvent!: EventEmitter<void>;
  #handleOpen() {
    this.#openEvent.emit();
  }

  /**
   * @description 调用 `close()` 方法后触发。
   */
  @event({ type: "close" })
  accessor #closeEvent!: EventEmitter<void>;
  #handleClose() {
    this.#closeEvent.emit();
  }

  /**
   * @description 打开加载步骤框。将 `visible` 设为 `true` 并触发 `open` 事件。
   */
  @method()
  open() {
    this.visible = true;
    this.#handleOpen();
  }

  /**
   * @description 关闭加载步骤框。将 `visible` 设为 `false` 并触发 `close` 事件。
   */
  @method({ bound: true })
  close() {
    this.visible = false;
    this.#handleClose();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    lockBodyScroll(this, false);
  }

  render() {
    return (
      <EoLoadingStepComponent
        curElement={this}
        visible={this.visible}
        width={this.width}
        stepTitle={this.stepTitle}
        stepList={this.stepList}
        curStep={this.curStep}
      />
    );
  }
}

const statusMap = {
  pending: {
    icon: <span className={classNames("step-item-icon", "pending-icon")} />,
  },
  loading: {
    icon: (
      <WrappedIcon
        lib="antd"
        theme="outlined"
        icon="loading"
        spinning
        className="step-item-icon"
      />
    ),
  },
  finished: {
    icon: (
      <WrappedIcon
        lib="antd"
        theme="filled"
        icon="check-circle"
        className="step-item-icon"
      />
    ),
  },
};

export interface EoLoadingStepProps {
  curElement?: HTMLElement;
  visible?: boolean;
  width?: string;
  stepTitle?: string;
  stepList?: StepItem[];
  curStep: string;
}

export function EoLoadingStepComponent(props: EoLoadingStepProps) {
  const { curElement, visible, width, stepTitle, stepList, curStep } = props;

  const currentTheme = useCurrentTheme();

  useEffect(() => {
    lockBodyScroll(curElement, visible);
  }, [visible]);

  const curIndex = useMemo(() => {
    return stepList?.findIndex((v) => v.key === curStep) ?? -1;
  }, [curStep, stepList]);

  return (
    <div className={classNames("root", visible ? "open" : "close")}>
      <div className="mask" />
      <div className="wrap">
        <div className="container" style={{ width: width }}>
          <img
            src={currentTheme === "dark-v2" ? StepDarkImage : StepImage}
            className="step-image"
          />
          <div className="step-title">{stepTitle}</div>
          <div className="step-list">
            {stepList?.map(({ title, key }, index) => {
              const status =
                curIndex > index
                  ? "finished"
                  : curIndex < index
                    ? "pending"
                    : "loading";

              return (
                <div key={key} className={classNames("step-item", status)}>
                  {statusMap[status].icon}
                  <span className="step-item-title"> {title} </span>
                  {index !== stepList.length - 1 && (
                    <div className="step-item-bar" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
