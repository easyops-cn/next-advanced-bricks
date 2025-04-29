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
import { EventEmitter, createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { unwrapProvider } from "@next-core/utils/general";
import { UseSingleBrickConf } from "@next-core/types";
import { ReactUseMultipleBricks } from "@next-core/react-runtime";
import { auth } from "@next-core/easyops-runtime";
import {
  ItemCallback,
  Layout,
  Responsive,
  WidthProvider,
} from "react-grid-layout";
import "@next-core/theme";
import {
  EoSidebarMenu,
  EoSidebarMenuProps,
} from "@next-bricks/nav/sidebar/sidebar-menu";
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

import { WorkbenchComponent, ExtraLayout } from "../interfaces";
import { DroppableComponentLayoutItem } from "./DroppableComponentLayoutItem";
import { DraggableComponentMenuItem } from "./DraggableComponentMenuItem";
import { getLayoutDefaultCardConfig } from "./utils";

import styles from "./styles.module.css";
import layoutItemStyles from "./DroppableComponentLayoutItem.module.css";
import "./styles.css";

const { defineElement, property, event, method } = createDecorators();

const WrappedSidebarMenu = wrapBrick<EoSidebarMenu, EoSidebarMenuProps>(
  "eo-sidebar-menu"
);
const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");
const WrappedDropdownButton = wrapBrick<
  DropdownButton,
  DropdownButtonProps,
  DropdownButtonEvents,
  DropdownButtonEventsMap
>("eo-dropdown-button", { onActionClick: "action.click" });
const showDialog = unwrapProvider<typeof _showDialog>("basic.show-dialog");

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

  const handleDragCallback: ItemCallback = (layout, oldItem, newItem) => {
    const placeholderDOM = gridLayoutRef.current?.querySelector(
      ".react-grid-placeholder"
    );
    if (placeholderDOM) {
      if (newItem.w > 1 && newItem.x > 0) {
        !placeholderDOM.classList.contains("forbidden") &&
          placeholderDOM.classList.add("forbidden");
      } else {
        placeholderDOM.classList.contains("forbidden") &&
          placeholderDOM.classList.remove("forbidden");
      }
    }
  };

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

      let isAllowAction = true;
      for (let t = 0; t < currentLayout.length; t++) {
        const { x, w, y, h, i, minH } = currentLayout[t];
        if (w > 1 && x > 0) {
          isAllowAction = false;
          break;
        }
        if (w === 1 && x < 2) {
          const matchItem = currentLayout.find(
            (item) => item.i !== i && item.w === 1 && item.y === y && x < 2
          );
          if (matchItem) {
            currentLayout[t].minH = currentLayout[t].minH ?? h;
            currentLayout[t].h = Math.max(matchItem.h, h);
          }
        } else {
          currentLayout[t].h = minH ?? h;
          currentLayout[t].minH = undefined;
        }
      }

      handleChange(
        !isAllowAction
          ? // revert to previous layouts
            layoutCacheRef.current.map((item) => {
              const { w, type, i } = item;
              // should update key to refresh layout
              const key = i ?? `${getRealKey(type as string)}:${Math.random()}`;
              let x = item.x;

              if (w > 1 && x > 0) {
                x = 0;
              }

              return { ...item, x, i: key };
            })
          : currentLayout.map((v) => {
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
        onActionClick?.(
          action,
          (layouts ?? []).map((item) => ({ ...item, i: getRealKey(item.i) }))
        );
    }
  };

  const addComponent = (
    component: WorkbenchComponent,
    layout?: Layout
  ): void => {
    const defaultCardConfig = getLayoutDefaultCardConfig(component.key);
    const newLayout = {
      ...defaultCardConfig,
      ...component.position,
      cardWidth: component.position.w,
      type: component.key,
      ...(layout
        ? pick(layout, ["x", "y"])
        : {
            x: component.position.w > 1 ? 0 : (layouts.length * 2) % cols,
            y: Infinity,
          }),
    };

    handleChange(layout ? [newLayout, ...layouts] : layouts.concat(newLayout));
  };

  const handleDeleteItem = useCallback(
    (deletedItem: WorkbenchComponent) => {
      handleChange(
        layouts.filter((item) => item.i !== deletedItem.position.i) ?? []
      );
    },
    [handleChange, layouts]
  );

  const renderChild = useMemo(() => {
    return layouts
      .map((layout) => {
        const component = keyComponentMap[getRealKey(layout.type as string)];
        if (!component) {
          return null;
        }
        return (
          <div
            className="drag-box"
            data-grid={{
              ...(component.position ?? {}),
              ...layout,
              w: layout.cardWidth || layout.w,
            }}
            key={layout.i}
          >
            <DroppableComponentLayoutItem
              component={component}
              isEdit={isEdit}
              layout={layout}
              onDelete={() => handleDeleteItem(component)}
            />
          </div>
        );
      })
      .filter(Boolean);
  }, [layouts, keyComponentMap, isEdit, handleDeleteItem]);

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
            <WrappedSidebarMenu>
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
            </WrappedSidebarMenu>
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
                { text: "从模版加载", event: "loadFromTemplate" },
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
          className={styles.layout}
          draggableCancel={`.${layoutItemStyles.deleteIcon},.edit-actions,.ignore-item`}
          breakpoints={{ lg: 1300, md: 1024, sm: 768 }}
          rowHeight={1}
          cols={{ lg: 3, md: 3, sm: isEdit ? 3 : 1 }}
          isResizable={false}
          isDraggable={isEdit}
          isDroppable={isEdit}
          onDrag={handleDragCallback}
          onDropDragOver={() => {
            if (draggingComponentRef.current) {
              return pick(draggingComponentRef.current.position, ["w", "h"]);
            }
          }}
          onDrop={(layout, item) => {
            if (draggingComponentRef.current) {
              addComponent(draggingComponentRef.current, item);
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
