import React, {
  createRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "classnames";
import { EventEmitter, createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { unwrapProvider } from "@next-core/utils/general";
import { UseSingleBrickConf } from "@next-core/types";
import { ReactUseMultipleBricks } from "@next-core/react-runtime";
import { auth } from "@next-core/easyops-runtime";
import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import "@next-core/theme";
import type { Button, ButtonProps } from "@next-bricks/basic/button";
import {
  DropdownButton,
  DropdownButtonEvents,
  DropdownButtonEventsMap,
  DropdownButtonProps,
} from "@next-bricks/basic/dropdown-button";
import type { showDialog as _showDialog } from "@next-bricks/basic/data-providers/show-dialog/show-dialog";
import { SimpleAction } from "@next-bricks/basic/actions";
import { keyBy, pick } from "lodash";
import { SizeMe } from "react-sizeme";
import { getBasePath } from "@next-core/runtime";
import { WorkbenchComponent, ExtraLayout } from "../interfaces";
import { DroppableComponentLayoutItem } from "./DroppableComponentLayoutItem";
import { DraggableComponentMenuItem } from "./DraggableComponentMenuItem";
import { getLayoutDefaultCardConfig } from "./utils";

import styles from "./styles.module.css";
import layoutItemStyles from "./DroppableComponentLayoutItem.module.css";
import "./styles.css";

const { defineElement, property, event, method } = createDecorators();

const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");
const WrappedDropdownButton = wrapBrick<
  DropdownButton,
  DropdownButtonProps,
  DropdownButtonEvents,
  DropdownButtonEventsMap
>("eo-dropdown-button", { onActionClick: "action.click" });
const showDialog = unwrapProvider<typeof _showDialog>("basic.show-dialog");

const ROW_HEIGHT = 1;
const MARGIN_WIDTH = 16;
const MARGIN_HEIGHT = 16;
const URl_PREFIX = `${window.location.origin}${getBasePath()}api/gateway/object_store.object_store.GetObject/api/v1/objectStore/bucket/sys-setting/object/`;
export interface EoWorkbenchLayoutV2Props {
  cardTitle?: string;
  layouts?: ExtraLayout[];
  toolbarBricks?: { useBrick: UseSingleBrickConf[] };
  componentList?: WorkbenchComponent[];
  isEdit?: boolean;
  showSettingButton?: boolean;
}

export interface EoWorkbenchLayoutV2ComponentRef {
  setLayouts(layouts: ExtraLayout[]): void;
}

export interface EoWorkbenchLayoutV2ComponentProps
  extends EoWorkbenchLayoutV2Props {
  onChange?: (layout: ExtraLayout[]) => void;
  onSave?: (layout: ExtraLayout[]) => void;
  onCancel?: () => void;
  onActionClick?: (action: SimpleAction, layouts: ExtraLayout[]) => void;
  onSetting?: () => void;
}

const getRealKey = (key: string): string =>
  key?.includes(":") ? key.split(":")[0] : key;
const { isAdmin } = auth.getAuth();

export const EoWorkbenchLayoutComponent = forwardRef<
  EoWorkbenchLayoutV2ComponentRef,
  EoWorkbenchLayoutV2ComponentProps
>(function EoWorkbenchLayoutComponent(
  {
    cardTitle = "卡片列表",
    layouts: layoutsProps,
    toolbarBricks,
    componentList = [],
    isEdit,
    showSettingButton,
    onChange,
    onSave,
    onCancel,
    onActionClick,
    onSetting,
  },
  ref
) {
  const ResponsiveReactGridLayout = useMemo(
    () => WidthProvider(Responsive),
    []
  );
  const gridLayoutRef = useRef<HTMLDivElement>(null);
  const layoutWrapperRef = useRef<HTMLDivElement>(null);
  const layoutCacheRef = useRef<ExtraLayout[]>(layoutsProps ?? []);
  const [layouts, _setLayouts] = useState<ExtraLayout[]>(
    layoutCacheRef.current
  );
  const keyComponentMap = useMemo(
    () => keyBy(componentList, "key"),
    [componentList]
  );
  const [cols, setCols] = useState<number>(3);
  const [layoutWrapperStyle, setLayoutWrapperStyle] =
    useState<React.CSSProperties>();
  const draggingComponentRef = useRef<WorkbenchComponent>();

  const setLayouts = useCallback((layouts: ExtraLayout[]) => {
    layoutCacheRef.current = layouts;
    _setLayouts(layouts);
  }, []);

  useImperativeHandle(ref, () => ({ setLayouts }));

  const handleChange = useCallback(
    (layouts: ExtraLayout[]) => {
      setLayouts(layouts);
      onChange?.(layouts);
    },
    [onChange, setLayouts]
  );

  // const handleDragCallback: ItemCallback = (layout, oldItem, newItem) => {
  //   const placeholderDOM = gridLayoutRef.current?.querySelector(
  //     ".react-grid-placeholder"
  //   );
  //   if (placeholderDOM) {
  //     if (newItem.w > 1 && newItem.x > 0) {
  //       !placeholderDOM.classList.contains("forbidden") &&
  //         placeholderDOM.classList.add("forbidden");
  //     } else {
  //       placeholderDOM.classList.contains("forbidden") &&
  //         placeholderDOM.classList.remove("forbidden");
  //     }
  //   }
  // };

  /* istanbul ignore next */
  const handleLayoutChange = useCallback(
    (currentLayout: ExtraLayout[]) => {
      if (!isEdit) {
        return;
      }

      // 占位拖拽不触发 setLayouts
      if (currentLayout.some((v) => v.isDraggable)) {
        return;
      }

      const currentLayoutsMap = keyBy(layouts, "i");
      for (let t = 0; t < currentLayout.length; t++) {
        const { x, w, y, h, i, minH } = currentLayout[t];
        if (w === 1 && x < 2) {
          const matchItem = currentLayout.find(
            (item) => item.i !== i && item.w === 1 && item.y === y && x < 2
          );
          if (matchItem) {
            currentLayout[t].minH = currentLayout[t].minH ?? h;
          }
        } else {
          currentLayout[t].h = minH ?? h;
          currentLayout[t].minH = undefined;
        }
      }

      handleChange(
        currentLayout.map((v) => {
          const layoutItem = currentLayoutsMap?.[v.i];
          return { ...layoutItem, ...v, type: getRealKey(v.i) };
        })
      );
    },
    [handleChange, isEdit, layouts]
  );

  const handleBreakpointChange = (_newBreakpoint: string, newCols: number) => {
    setCols(newCols);
  };

  const handleClearLayout = () => {
    handleChange([]);
  };

  const handleSave = useCallback(() => {
    onSave?.(layouts);
  }, [layouts, onSave]);

  const handleSetting = () => {
    onSetting?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleActionClick = (action: SimpleAction) => {
    const { event } = action;

    switch (event) {
      case "clear":
        showDialog({
          type: "confirm",
          title: "清空确认",
          content: "将清空所有卡片，从零开始编辑，该操作无法撤回。",
        }).then(handleClearLayout);
        break;
      default:
        onActionClick?.(action, layouts ?? []);
    }
  };

  const addComponent = (
    component: WorkbenchComponent,
    currentLayouts?: Layout[]
  ): void => {
    const defaultCardConfig = getLayoutDefaultCardConfig(component.key);
    const currentLayoutsMap = keyBy(currentLayouts, "i");
    const newLayouts = layouts.map((layout) => {
      return {
        ...layout,
        ...pick(currentLayoutsMap?.[layout.i], ["x", "y"]),
      };
    });
    let newLayout = {
      ...defaultCardConfig,
      ...component.position,
      i: `${component.key}:${Math.random()}`,
      cardWidth: component.position.w,
      type: component.key,
      x: component.position.w > 1 ? 0 : (layouts.length * 2) % cols,
      y: Infinity,
    };
    if (currentLayouts) {
      const dropItem = currentLayouts.find((v) => v.i === "__dropping-elem__");
      newLayout = {
        ...newLayout,
        ...pick(dropItem, "x", "y"),
      };
      handleChange([newLayout, ...newLayouts]);
      return;
    }
    handleChange(layouts.concat(newLayout));
  };

  const handleDeleteItem = useCallback(
    (i: string) => {
      handleChange(layouts.filter((item) => item.i !== i) ?? []);
    },
    [handleChange, layouts]
  );

  /* istanbul ignore next */
  const handleResize = useCallback(
    (i: string, contentHeight: number) => {
      const newH = Math.ceil(
        (contentHeight + MARGIN_HEIGHT) / (MARGIN_HEIGHT + ROW_HEIGHT)
      );
      const oldLayout = layouts.find((layout: ExtraLayout) => layout.i === i);

      if (!oldLayout) return;

      const currentH = Math.ceil(oldLayout.h);
      if (currentH !== newH) {
        const newLayouts = layouts.map((item) =>
          item.i === i ? { ...item, h: newH } : item
        );
        handleChange(newLayouts);
      }
    },
    [layouts, handleChange]
  );

  const renderChild = useMemo(() => {
    return layouts
      .map((layout) => {
        const component = keyComponentMap[getRealKey(layout.type as string)];
        if (!component) {
          return null;
        }
        const background =
          layout?.cardBgType === "picture"
            ? `url("${URl_PREFIX}${layout?.cardBackground}") no-repeat center / cover`
            : layout?.cardBgType === "color"
              ? layout?.cardBackground
              : "#fff";
        const border =
          layout?.cardBorderStyle === "solid"
            ? `${layout?.cardBorderWidth}px ${layout?.cardBorderStyle} ${layout?.cardBorderColor}`
            : (layout?.cardBorderStyle ?? "1px solid #e8e8e8");
        const borderRadius = `${layout?.cardBorderRadius ?? 6}px`;

        return (
          <div
            className="drag-box"
            data-grid={{
              ...(component.position ?? {}),
              ...layout,
              w: layout.cardWidth || layout.w,
            }}
            key={layout.i}
            style={{
              ...(component.style||{}),
              background,
              border,
              borderRadius,
              backdropFilter: "blur(10px)"
            }}
          >
            <SizeMe monitorHeight>
              {({ size }) => {
                if (size.height) {
                  handleResize(layout.i, size.height);
                }
                return (
                  <DroppableComponentLayoutItem
                    component={component}
                    isEdit={isEdit}
                    layout={layout}
                    onDelete={handleDeleteItem}
                  />
                );
              }}
            </SizeMe>
          </div>
        );
      })
      .filter(Boolean);
  }, [layouts, keyComponentMap, isEdit, handleDeleteItem, handleResize]);

  const handleWatchLayoutSizeChange = useCallback(() => {
    if (layoutWrapperRef && isEdit) {
      const { top } =
        layoutWrapperRef.current?.getClientRects()?.[0] ?? ({} as DOMRect);
      top !== undefined &&
        setLayoutWrapperStyle({
          height: document.body.clientHeight - top,
        });
    }
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) {
      handleWatchLayoutSizeChange();
      setLayouts(layoutsProps || []); // 编辑的情况下需要动态改变一些布局
      window.addEventListener("resize", handleWatchLayoutSizeChange);

      return () => {
        window.removeEventListener("resize", handleWatchLayoutSizeChange);
      };
    }
  }, [isEdit, handleWatchLayoutSizeChange, layoutsProps, setLayouts]);

  return (
    <div className={styles.gridLayoutWrapper} ref={gridLayoutRef}>
      {isEdit && (
        <div className={styles.componentWrapper} style={layoutWrapperStyle}>
          <div className={styles.componentTitle}>{cardTitle}</div>
          <div className={styles.componentList}>
            {componentList?.map((component, index) => (
              <DraggableComponentMenuItem
                component={component}
                onClick={() => {
                  addComponent(component);
                }}
                onDragStart={() => {
                  draggingComponentRef.current = component;
                }}
                onDragEnd={() => {
                  draggingComponentRef.current = undefined;
                }}
                key={component.key || index}
              />
            ))}
            {toolbarBricks?.useBrick && (
              <ReactUseMultipleBricks useBrick={toolbarBricks.useBrick} />
            )}
          </div>
        </div>
      )}
      <div
        className={styles.layoutWrapper}
        ref={layoutWrapperRef}
        style={layoutWrapperStyle}
      >
        {isEdit && (
          <div className={styles.actionsWrapper}>
            <WrappedButton type="primary" onClick={handleSave}>
              保存
            </WrappedButton>
            <WrappedButton onClick={handleCancel}>取消</WrappedButton>
            {showSettingButton && (
              <WrappedButton
                data-testid="setting-button"
                onClick={handleSetting}
              >
                设置
              </WrappedButton>
            )}
            <WrappedDropdownButton
              btnText="更多"
              icon={{ lib: "antd", icon: "down" }}
              actions={[
                ...(isAdmin
                  ? [{ text: "另存为模板", event: "saveAsTemplate" }]
                  : []),
                { text: "从模板加载", event: "loadFromTemplate" },
                { text: "清空所有", danger: true, event: "clear" },
              ]}
              onActionClick={(e) => {
                handleActionClick(e.detail);
              }}
              data-testid="edit-layout-actions"
            />
          </div>
        )}
        <ResponsiveReactGridLayout
          className={classNames(styles.layout, {
            [`${styles.layoutEdit}`]: isEdit,
          })}
          draggableCancel={`.${layoutItemStyles.deleteIcon},.edit-actions,.ignore-item`}
          breakpoints={{ lg: 1300, md: 1024, sm: 768 }}
          rowHeight={ROW_HEIGHT}
          cols={{ lg: 3, md: 3, sm: isEdit ? 3 : 1 }}
          isResizable={false}
          isDraggable={isEdit}
          isDroppable={isEdit}
          compactType="vertical"
          margin={[MARGIN_WIDTH, MARGIN_HEIGHT]}
          // onDrag={handleDragCallback}
          useCSSTransforms={false}
          onDropDragOver={() => {
            if (draggingComponentRef.current) {
              return pick(draggingComponentRef.current.position, ["w", "h"]);
            }
          }}
          onDrop={(layout) => {
            if (draggingComponentRef.current) {
              addComponent(draggingComponentRef.current, layout);
            }
          }}
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={handleBreakpointChange}
        >
          {renderChild}
        </ResponsiveReactGridLayout>
      </div>
    </div>
  );
});

/**
 * 工作台布局V2,未使用shadow dom
 */
export
@defineElement("eo-workbench-layout-v2", { shadowOptions: false })
class EoWorkbenchLayoutV2 extends ReactNextElement {
  #componentRef = createRef<EoWorkbenchLayoutV2ComponentRef>();

  @property()
  accessor cardTitle: string | undefined;

  @property({ type: Boolean })
  accessor isEdit: boolean | undefined;

  @property({ attribute: false })
  accessor layouts: ExtraLayout[] | undefined;

  @property({ attribute: false })
  accessor toolbarBricks: { useBrick: UseSingleBrickConf[] } | undefined;

  @property({ attribute: false })
  accessor componentList: WorkbenchComponent[] | undefined;
  /**
   * description: 用于设置页面样式和布局的按钮
   */
  @property({ type: Boolean })
  accessor showSettingButton: boolean | undefined;

  @event({ type: "change" })
  accessor #changeEvent!: EventEmitter<ExtraLayout[]>;

  #handleChange = (layouts: ExtraLayout[]) => {
    this.#changeEvent.emit(layouts);
  };

  @event({ type: "save" })
  accessor #saveEvent!: EventEmitter<ExtraLayout[]>;

  #handleSave = (layouts: ExtraLayout[]) => {
    this.#saveEvent.emit(layouts);
  };

  @event({ type: "cancel" })
  accessor #cancelEvent!: EventEmitter<void>;

  #handleCancel = () => {
    this.#cancelEvent.emit();
  };

  @event({ type: "setting" })
  accessor #settingEvent!: EventEmitter<void>;
  #handleSetting = () => {
    this.#settingEvent.emit();
  };

  /**
   * 操作点击事件
   * @detail {
        action: SimpleAction;
        layouts: Layout[];
      }
   */
  @event({ type: "action.click" })
  accessor #actionClickEvent!: EventEmitter<{
    action: SimpleAction;
    layouts: Layout[];
  }>;

  #handleActionClick = (action: SimpleAction, layouts: Layout[]): void => {
    this.#actionClickEvent.emit({ action, layouts });
    action.event &&
      this.dispatchEvent(new CustomEvent(action.event, { detail: layouts }));
  };

  @method()
  setLayouts(layouts: Layout[]) {
    this.#componentRef.current?.setLayouts(layouts);
  }

  connectedCallback(): void {
    // Don't override user's style settings.
    // istanbul ignore else
    if (!this.style.display) {
      this.style.display = "block";
    }
    super.connectedCallback();
  }

  render() {
    return (
      <EoWorkbenchLayoutComponent
        cardTitle={this.cardTitle}
        layouts={this.layouts}
        toolbarBricks={this.toolbarBricks}
        componentList={this.componentList}
        showSettingButton={this.showSettingButton}
        isEdit={this.isEdit}
        onChange={this.#handleChange}
        onSave={this.#handleSave}
        onCancel={this.#handleCancel}
        onActionClick={this.#handleActionClick}
        onSetting={this.#handleSetting}
        ref={this.#componentRef}
      />
    );
  }
}
