import React, {
  createRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { EventEmitter, createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import classNames from "classnames";
import styleText from "./styles.shadow.css";

const { defineElement, property, event, method } = createDecorators();

export interface EditableLabelProps {
  label?: string;
  type?: LabelType;
  readOnly?: boolean;
}

export type LabelType = "line" | "default";

export interface EditableLabelRef {
  enableEditing(): void;
}

export const EditableLabelComponent = forwardRef(LegacyEditableLabelComponent);

export interface EditableLabelEventsMap {
  "label.editing.change": CustomEvent<boolean>;
  "label.change": CustomEvent<string>;
}

export interface EditableLabelEventsMapping {
  onLabelEditingChange: "label.editing.change";
  onLabelChange: "label.change";
}

/**
 * @description 可编辑标签构件，用于在图表连线或节点上展示可双击编辑的文本标签，支持只读模式，常配合 `eo-draw-canvas` 和 `eo-diagram` 使用。
 * @category diagram
 */
export
@defineElement("diagram.editable-label", {
  styleTexts: [styleText],
})
class EditableLabel extends ReactNextElement implements EditableLabelProps {
  /**
   * @description 标签文本内容。
   */
  @property()
  accessor label: string | undefined;

  /**
   * @description 标签类型，`line` 用于连线标签样式，`default` 为默认节点标签样式，影响外观渲染（使用 `render: false` 仅更新属性不触发重渲染）。
   */
  @property({ render: false })
  accessor type: LabelType | undefined;

  /**
   * @description 是否为只读模式，启用后双击不会进入编辑状态，`enableEditing` 方法调用也不会生效。
   */
  @property({ type: Boolean })
  accessor readOnly: boolean | undefined;

  /**
   * @detail `boolean` — 当前是否处于编辑状态，true 表示正在编辑，false 表示结束编辑
   * @description 标签编辑状态变化时触发，当用户开始编辑（双击或调用 `enableEditing`）或结束编辑（失焦/按 Enter）时触发。
   */
  @event({ type: "label.editing.change" })
  accessor #labelEditingChange!: EventEmitter<boolean>;

  #handleLabelEditingChange = (value: boolean) => {
    this.#labelEditingChange.emit(value);
  };

  /**
   * @detail `string` — 编辑完成后的新标签文本
   * @description 标签编辑完成后触发（用户失焦或按 Enter 键），即使内容未变化也会触发，需自行判断是否发生实际变更。
   */
  @event({ type: "label.change" })
  accessor #labelChange!: EventEmitter<string>;

  #handleLabelChange = (value: string) => {
    this.#labelChange.emit(value);
  };

  /**
   * @description 以编程方式启用标签的编辑状态（相当于用户双击），只读模式下不生效。
   */
  @method()
  enableEditing() {
    this.#editableLabelRef.current?.enableEditing();
  }

  #editableLabelRef = createRef<EditableLabelRef>();

  render() {
    return (
      <EditableLabelComponent
        ref={this.#editableLabelRef}
        label={this.label}
        readOnly={this.readOnly}
        onLabelEditingChange={this.#handleLabelEditingChange}
        onLabelChange={this.#handleLabelChange}
      />
    );
  }
}

export interface EditableLabelComponentProps extends EditableLabelProps {
  onLabelEditingChange?(value: boolean): void;
  onLabelChange?(value: string): void;
}

export function LegacyEditableLabelComponent(
  {
    label: _label,
    readOnly,
    onLabelChange,
    onLabelEditingChange,
  }: EditableLabelComponentProps,
  ref: React.Ref<EditableLabelRef>
) {
  const label = _label ?? "";
  const [currentLabel, setCurrentLabel] = useState<string>(label);
  const [editingLabel, setEditingLabel] = useState(false);
  const editingLabelInitialized = useRef(false);
  const [shouldEmitLabelChange, setShouldEmitLabelChange] = useState(false);
  const labelInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    enableEditing() {
      readOnly || setEditingLabel(true);
    },
  }));

  useEffect(() => {
    setCurrentLabel(label);
  }, [label]);

  const handleEditLabel = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      setEditingLabel(true);
    },
    [readOnly]
  );

  useEffect(() => {
    if (editingLabel) {
      // Prevent scroll when focusing.
      // Otherwise the diagram svg may be clipped in Chrome.
      labelInputRef.current?.focus({ preventScroll: true });
      labelInputRef.current?.select();
    }
  }, [editingLabel]);

  useEffect(() => {
    if (editingLabelInitialized.current) {
      onLabelEditingChange?.(editingLabel);
    } else {
      editingLabelInitialized.current = true;
    }
  }, [editingLabel, onLabelEditingChange]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentLabel(event.target.value);
    },
    []
  );

  const handleInputKeydown = useCallback((event: React.KeyboardEvent) => {
    event.stopPropagation();
    const key =
      event.key ||
      /* istanbul ignore next: compatibility */ event.keyCode ||
      /* istanbul ignore next: compatibility */ event.which;
    if (key === "Enter" || key === 13) {
      labelInputRef.current?.blur();
    }
  }, []);

  const handleInputBlur = useCallback(() => {
    setEditingLabel(false);
    setShouldEmitLabelChange(true);
  }, []);

  useEffect(() => {
    if (shouldEmitLabelChange) {
      onLabelChange?.(currentLabel);
      setShouldEmitLabelChange(false);
    }
  }, [currentLabel, onLabelChange, shouldEmitLabelChange]);

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className={classNames("label", {
        editing: editingLabel,
        empty: !currentLabel,
      })}
      onDoubleClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      <input
        className="label-input"
        value={currentLabel}
        ref={labelInputRef}
        onChange={handleInputChange}
        onKeyDown={handleInputKeydown}
        onBlur={handleInputBlur}
        onContextMenu={stopPropagation}
      />
      <div className="label-text" onDoubleClick={handleEditLabel}>
        {currentLabel}
      </div>
    </div>
  );
}
