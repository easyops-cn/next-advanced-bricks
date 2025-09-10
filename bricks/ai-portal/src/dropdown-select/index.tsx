import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createDecorators, EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { debounce } from "lodash";
import { initializeI18n } from "@next-core/i18n";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import {
  Popover,
  PopoverProps,
  PopoverEvents,
  PopoverEventsMapping,
} from "@next-bricks/basic/popover";
import { Menu } from "@next-bricks/basic/menu";
import { MenuItem, MenuComponentProps } from "@next-bricks/basic/menu-item";
import { GeneralIcon, GeneralIconProps } from "@next-bricks/icons/general-icon";
import {
  LoadingContainer,
  LoadingContainerProps,
} from "@next-bricks/basic/loading-container";
import { Input, InputEvents, InputProps } from "@next-bricks/form/input";

initializeI18n(NS, locales);

const { defineElement, property, event } = createDecorators();
const WrappedPopover = wrapBrick<
  Popover,
  PopoverProps,
  PopoverEvents,
  PopoverEventsMapping
>("eo-popover", {
  onVisibleChange: "visible.change",
  onBeforeVisibleChange: "before.visible.change",
});

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedLoadingContainer = wrapBrick<
  LoadingContainer,
  LoadingContainerProps
>("eo-loading-container");

const WrappedMenu = wrapBrick<Menu, unknown>("eo-menu");
const WrappedMenuItem = wrapBrick<MenuItem, MenuComponentProps>("eo-menu-item");

export interface InputEventsMap {
  onValueChange: "change";
}

const WrappedInput = wrapBrick<Input, InputProps, InputEvents, InputEventsMap>(
  "eo-input",
  {
    onValueChange: "change",
  }
);

export interface DropdownSelectProps {
  value?: string;
  options?: DropdownOptions[];
  labelMaxWidth?: string | number;
  dropdownMaxWidth?: string | number;
  showSearch?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
}

interface DropdownOptions {
  label: string;
  value: string;
  disabled?: boolean;
  [key: string]: unknown;
}

/**
 * 构件 `ai-portal.dropdown-select`
 */
export
@defineElement("ai-portal.dropdown-select", {
  styleTexts: [styleText],
})
class DropdownSelect extends ReactNextElement implements DropdownSelectProps {
  @property()
  accessor value: string | undefined;

  @property({ attribute: false })
  accessor options: DropdownOptions[] | undefined;

  @property({ attribute: false })
  accessor labelMaxWidth: string | number | undefined;

  @property({ type: Boolean })
  accessor loading: boolean | undefined;

  @property({ attribute: false })
  accessor searchPlaceholder: string | undefined;

  /**
   * @default "500px"
   */
  @property({ attribute: false })
  accessor dropdownMaxWidth: string | number | undefined;

  /** 是否展示搜索框 */
  @property({ type: Boolean })
  accessor showSearch: boolean | undefined;

  @event({ type: "change" })
  accessor #changeEvent!: EventEmitter<DropdownOptions>;

  #handleChange = (option: DropdownOptions) => {
    this.#changeEvent.emit(option);
  };

  render() {
    return (
      <DropdownSelectComponent
        value={this.value}
        options={this.options}
        onChange={this.#handleChange}
        loading={this.loading}
        labelMaxWidth={this.labelMaxWidth}
        dropdownMaxWidth={this.dropdownMaxWidth}
        showSearch={this.showSearch}
        searchPlaceholder={this.searchPlaceholder}
      />
    );
  }
}

interface DropdownSelectComponentProps extends DropdownSelectProps {
  onChange: (option: DropdownOptions) => void;
}

function DropdownSelectComponent({
  value: _value,
  options: _options,
  labelMaxWidth,
  dropdownMaxWidth,
  showSearch,
  loading,
  searchPlaceholder,
  onChange,
}: DropdownSelectComponentProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(_value);
  const [q, setQ] = useState("");
  const [options, setOptions] = useState<DropdownOptions[] | undefined>(
    _options
  );

  useEffect(() => {
    setOptions(_options);
  }, [_options]);

  const activeOption = useMemo(() => {
    return options?.find((opt) => opt.value === value);
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!q || !options) {
      return options;
    }
    return options?.filter((ops) =>
      ops.label.toLowerCase().includes(q.toLowerCase())
    );
  }, [options, q]);

  const handleBeforeVisibleChange = useCallback((e: CustomEvent<boolean>) => {
    setOpen(e.detail);
    if (!e.detail) {
      setQ("");
    }
  }, []);

  const handleSearchChange = useMemo(
    () =>
      debounce((evt: CustomEvent<string>) => {
        setQ(evt.detail);
      }, 300),
    []
  );

  return (
    <WrappedPopover
      placement="bottom-start"
      trigger="click"
      active={open}
      arrow={false}
      distance={5}
      onBeforeVisibleChange={handleBeforeVisibleChange}
    >
      <span slot="anchor" className="trigger">
        <span className="label" style={{ maxWidth: labelMaxWidth }}>
          {activeOption ? activeOption?.label : t(K.PLEASE_SELECT)}
        </span>
        <WrappedIcon lib="lucide" icon={open ? "chevron-up" : "chevron-down"} />
      </span>
      <div className="dropdown" style={{ maxWidth: dropdownMaxWidth }}>
        {showSearch && (
          <div className="search-container">
            <WrappedInput
              className="search"
              value={q}
              placeholder={searchPlaceholder || t(K.SEARCH_PLACEHOLDER)}
              onValueChange={handleSearchChange}
            >
              <WrappedIcon slot="prefix" lib="antd" icon="search" />
            </WrappedInput>
          </div>
        )}
        <WrappedLoadingContainer
          loading={loading}
          delay={500}
          style={{ width: "100%" }}
        >
          <div className="dropdown-inner">
            <slot name="prefix" />
            {!!filteredOptions?.length && (
              <WrappedMenu>
                {filteredOptions?.map((opt) => (
                  <WrappedMenuItem
                    key={opt.value}
                    disabled={opt.disabled}
                    className={value === opt.value ? "active" : undefined}
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpen(false);
                      if (value !== opt.value) {
                        setValue(opt.value);
                        onChange(opt);
                      }
                    }}
                  >
                    {opt.label}
                  </WrappedMenuItem>
                ))}
              </WrappedMenu>
            )}
            {!filteredOptions?.length && (
              <div className="empty">{t(K.SEARCH_NO_DATA)}</div>
            )}
          </div>
        </WrappedLoadingContainer>
      </div>
    </WrappedPopover>
  );
}
