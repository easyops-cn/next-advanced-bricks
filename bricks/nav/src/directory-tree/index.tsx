import React, { useMemo, useState } from "react";
import { EventEmitter, createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import styleText from "./styles.shadow.css";
import {
  GeneralSearch,
  SearchProps,
  SearchEvents,
  SearchEventsMap,
} from "@next-bricks/form/search";
import { Tree } from "./Tree";
import {
  getFlattenTreeData,
  getAllExpandableKeys,
  getExpandableKeysAccordingToSelectedKeys,
  searchTree,
} from "./utils";
import { DirectoryTreeContext } from "./DirectoryTreeContext";
import { UseBrickConf } from "@next-core/types";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";

const { defineElement, property, method, event } = createDecorators();

const WrappedSearch = wrapBrick<
  GeneralSearch,
  SearchProps,
  SearchEvents,
  SearchEventsMap
>("eo-search", {
  onChange: "change",
  onSearch: "search",
});

/**
 * 传入的 data 类型
 */
export interface TreeItem {
  key: string;
  title: string;
  icon?: GeneralIconProps;
  faded?: boolean;
  children?: TreeItem[];
  [key: string]: any;
}

/**
 * 内部格式化后的类型
 */
export interface TreeData {
  title: string;
  key: string;
  pos: string;
  depth: number;
  index: number;
  data: TreeItem;
  parent?: TreeData;
  children?: TreeData[];
}

/**
 * useBrick、事件使用的类型
 */
export interface NodeData {
  depth: number;
  index: number;
  data: TreeItem;
}

export interface EoDirectoryTreeProps {
  data: TreeItem[];
  directoryTitle?: string;
  internalNodeSelectable?: boolean;
  searchable?: boolean;
  placeholder?: string;
  selectedKeys?: string[];
  expandedKeys?: string[];
  searchFields?: (string | string[])[];
  suffixBrick?: { useBrick: UseBrickConf };
}

export interface SuffixBrickConf {
  /**
   * @default "always"
   */
  when?: "always" | "hover";
  useBrick: UseBrickConf;
}

/**
 * 目录树
 */
export
@defineElement("eo-directory-tree", {
  styleTexts: [styleText],
})
class EoDirectoryTree extends ReactNextElement {
  /**
   * 数据源
   */
  @property({
    attribute: false,
  })
  accessor data: TreeItem[] = [];

  /**
   * 目录标题
   */
  @property()
  accessor directoryTitle: string | undefined;

  /**
   * 设置中间节点是否可选，默认只有叶子节点可选
   */
  @property({ type: Boolean })
  accessor internalNodeSelectable: boolean | undefined;

  /**
   * 可搜索
   */
  @property({
    type: Boolean,
  })
  accessor searchable: boolean | undefined;

  /**
   * 搜索占位说明
   */
  @property()
  accessor placeholder: string | undefined;

  /**
   * 除了 title 以外，额外的搜索字段
   */
  @property({
    attribute: false,
  })
  accessor searchFields: (string | string[])[] | undefined;

  /**
   * 后缀 useBrick
   */
  @property({
    attribute: false,
  })
  accessor suffixBrick: SuffixBrickConf | undefined;

  /**
   * 选中的 keys
   */
  @property({
    attribute: false,
  })
  accessor selectedKeys: string[] | undefined;

  /**
   * 展开的 keys
   */
  @property({
    attribute: false,
  })
  accessor expandedKeys: string[] | undefined;

  /**
   * 展开全部
   */
  @method()
  expandAll() {
    this.expandedKeys = getAllExpandableKeys(this.data);
  }

  /**
   * 收起全部
   */
  @method()
  collapseAll() {
    this.expandedKeys = [];
  }

  /**
   * 根据选择项展开
   */
  @method()
  expandAccordingToSelectedKeys() {
    this.expandedKeys = getExpandableKeysAccordingToSelectedKeys(
      this.data,
      new Set(this.selectedKeys)
    );
  }

  /**
   * 展开事件
   * @detail keys - 展开的 keys
   */
  @event({ type: "expand" })
  accessor #expandEvent!: EventEmitter<{ keys: string[]; node: NodeData }>;
  #handleExpand = (data: { keys: string[]; node: NodeData }) => {
    this.expandedKeys = data.keys;
    this.#expandEvent.emit(data);
  };

  /**
   * 选择事件
   * @detail keys - 选择的 keys
   */
  @event({ type: "select" })
  accessor #selectEvent!: EventEmitter<{ keys: string[]; node: NodeData }>;
  #handleSelect = (data: { keys: string[]; node: NodeData }) => {
    this.selectedKeys = data.keys;
    this.#selectEvent.emit(data);
  };

  render() {
    return (
      <EoDirectoryTreeComponent
        element={this}
        data={this.data}
        directoryTitle={this.directoryTitle}
        internalNodeSelectable={this.internalNodeSelectable}
        placeholder={this.placeholder}
        searchable={this.searchable}
        searchFields={this.searchFields}
        suffixBrick={this.suffixBrick}
        selectedKeys={this.selectedKeys}
        expandedKeys={this.expandedKeys}
        onExpand={this.#handleExpand}
        onSelect={this.#handleSelect}
      />
    );
  }
}

interface EoDirectoryTreeComponentProps extends EoDirectoryTreeProps {
  element: EoDirectoryTree;
  onExpand: (data: { keys: string[]; node: NodeData }) => void;
  onSelect: (data: { keys: string[]; node: NodeData }) => void;
}

export function EoDirectoryTreeComponent(props: EoDirectoryTreeComponentProps) {
  const {
    element,
    data,
    directoryTitle,
    internalNodeSelectable,
    searchable,
    searchFields,
    placeholder,
    suffixBrick,
    onSelect,
    onExpand,
  } = props;

  const expandedKeysSet = useMemo(
    () => new Set(props.expandedKeys),
    [props.expandedKeys]
  );
  const selectedKeysSet = useMemo(
    () => new Set(props.selectedKeys),
    [props.selectedKeys]
  );

  const [q, setQ] = useState("");

  const handleSearch = (e: CustomEvent<string>) => {
    setQ(e.detail);
  };

  const searchedData = useMemo(() => {
    const result = searchTree(data, q, (searchFields || []).concat("title"));
    if (q) {
      element.expandedKeys = result.expandedKeys;
    }
    return result.data;
  }, [data, q, searchFields]);

  const treeData = useMemo(() => {
    return getFlattenTreeData(searchedData, expandedKeysSet);
  }, [searchedData, expandedKeysSet]);

  return (
    <DirectoryTreeContext.Provider
      value={{
        expandedKeysSet,
        selectedKeysSet,
        internalNodeSelectable,
        onSelect,
        onExpand,
        suffixBrick,
      }}
    >
      <div className="directory-container">
        {directoryTitle && (
          <div className="directory-title-container">
            <div className="directory-title" title={directoryTitle}>
              {directoryTitle}
            </div>
            <div className="directory-title-toolbar">
              <slot name="toolbar" />
            </div>
          </div>
        )}
        {searchable && (
          <WrappedSearch
            className="directory-search"
            trim
            placeholder={placeholder}
            onSearch={handleSearch}
          />
        )}
        <div className="tree">
          <Tree treeData={treeData} />
        </div>
      </div>
    </DirectoryTreeContext.Provider>
  );
}
