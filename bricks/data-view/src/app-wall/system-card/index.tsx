import React, { useEffect, useRef } from "react";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { createDecorators, EventEmitter } from "@next-core/element";
import styleText from "./system-card.shadow.css";
import variablesStyleText from "../../data-view-variables.shadow.css";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";

const { defineElement, property, event } = createDecorators();
const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
type StatusType = "normal" | "warning";
interface DescriptionItem {
  key: string;
  value: string;
}
export interface SystemCardProps {
  status: StatusType;
  cardTitle: string | undefined;
  itemList?: DescriptionItem[];
  buttonName?: string;
  handleClick?: () => void;
  containerStyle?: React.CSSProperties;
}

/**
 * 应用墙系统卡片
 * @author astrid
 * @category big-screen-layout
 */
@defineElement("data-view.app-wall-system-card", {
  styleTexts: [variablesStyleText, styleText],
})
class SystemCard extends ReactNextElement implements SystemCardProps {
  /**
   * 卡片状态
   */
  @property({ attribute: false })
  accessor status: StatusType = "normal";

  /**
   * 卡片标题
   */
  @property()
  accessor cardTitle: string | undefined;

  /**
   * 卡片信息数据
   */
  @property({ attribute: false })
  accessor itemList: DescriptionItem[];

  /**
   * 按钮名称
   */
  @property()
  accessor buttonName: string | undefined;

  /**
   * 外层容器样式
   */
  @property({ attribute: false })
  accessor containerStyle: React.CSSProperties;

  /**
   * @detail `void`
   * @description 按钮点击事件
   */
  @event({ type: "button-click" })
  accessor #onClickEvent!: EventEmitter<void>;

  handleClick = () => {
    this.#onClickEvent.emit();
  };

  render(): React.ReactNode {
    return (
      <SystemCardComponent
        buttonName={this.buttonName}
        status={this.status}
        cardTitle={this.cardTitle}
        itemList={this.itemList}
        handleClick={this.handleClick}
        containerStyle={this.containerStyle}
      />
    );
  }
}

export function SystemCardComponent(
  props: SystemCardProps
): React.ReactElement {
  const {
    // status,
    itemList,
    cardTitle,
    buttonName,
    handleClick,
    containerStyle,
  } = props;
  const descriptionRef = useRef<HTMLDivElement>();

  useEffect(() => {
    descriptionRef.current?.scrollTo?.(0, 0);
  }, [itemList]);

  return (
    <div className="wrapper" style={containerStyle}>
      <div className="cardName" title={cardTitle}>
        {cardTitle}
      </div>
      {itemList?.length && (
        <div className="descriptions" ref={descriptionRef}>
          {itemList.map((item, index) => (
            <div key={index} className="descriptionsItem">
              <div className="itemKey">{item.key}</div>
              <div className="itemValue">{item.value}</div>
            </div>
          ))}
        </div>
      )}
      {buttonName && (
        <div className="buttonContent" onClick={handleClick}>
          <WrappedIcon lib="antd" icon="fall" theme="outlined" />
          <span className="buttonName">{buttonName}</span>
        </div>
      )}
    </div>
  );
}

export { SystemCard };
