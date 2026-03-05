---
tagName: eo-directory
displayName: WrappedEoDirectory
description: 目录
category: ""
source: "@next-bricks/nav"
---

# WrappedEoDirectory

> 目录

## 导入

```tsx
import { WrappedEoDirectory } from "@easyops/wrapped-components";
```

## Props

| 属性                | 类型                                      | 必填 | 默认值    | 说明                             |
| ------------------- | ----------------------------------------- | ---- | --------- | -------------------------------- |
| position            | `"static" \| "fixed"`                     | 是   | `"fixed"` | 设置定位方式：静态定位或固定定位 |
| directoryTitle      | `string \| undefined`                     | 否   | —         | 目录标题                         |
| menuItems           | `MenuItem[]`                              | 是   | `[]`      | 菜单数据                         |
| hideRightBorder     | `boolean`                                 | 是   | `false`   | 是否隐藏右边线                   |
| suffixBrick         | `{ useBrick: UseBrickConf } \| undefined` | 否   | —         | 后缀 useBrick                    |
| defaultSelectedKeys | `string[] \| undefined`                   | 否   | —         | 默认选中高亮的菜单项             |

## Events

| 事件              | detail                                                                                            | 说明                     |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------ |
| onMenuItemClick   | `MenuItemClickEventDetail` — { groupKey: 对应分组的 key（仅分组子项有值）, data: 被点击的菜单项 } | 菜单项点击时触发         |
| onSuffixIconClick | `{ key: string }` — { key: 对应菜单项或分组的 key }                                               | 点击菜单项后缀图标时触发 |

## Examples

### Basic

展示带分组和子项的目录菜单，支持点击菜单项和后缀图标。

```tsx
<div style={{ width: 200, height: 500 }}>
  <WrappedEoDirectory
    defaultSelectedKeys={["strategy1"]}
    directoryTitle="目录标题"
    suffixBrick={{
      useBrick: {
        brick: "eo-tag",
        properties: { textContent: "<% DATA.data.title %>" },
      },
    }}
    menuItems={[
      {
        title: "测试",
        type: "group",
        suffixIcon: { lib: "antd", icon: "plus-circle", theme: "outlined" },
        key: "test",
        children: [
          { key: "strategy1", title: "数据1" },
          { key: "strategy2", title: "数据2" },
        ],
      },
      {
        title: "其他",
        type: "group",
        suffixIcon: { lib: "antd", icon: "plus-circle", theme: "outlined" },
        suffixIconDisabled: true,
        suffixIconTooltip: "禁止点击",
        key: "otherKey",
        children: [{ key: "manual-strategy1", title: "数据3" }],
      },
    ]}
    onMenuItemClick={(e) => console.log(e.detail)}
    onSuffixIconClick={(e) => console.log(e.detail)}
  />
</div>
```

### Hide Right Border

隐藏目录右侧边线，适用于特定布局场景。

```tsx
<div style={{ width: 200, height: 300 }}>
  <WrappedEoDirectory
    hideRightBorder={true}
    directoryTitle="无右边线目录"
    menuItems={[
      {
        title: "分组A",
        type: "group",
        key: "groupA",
        children: [
          { key: "item1", title: "子项1" },
          { key: "item2", title: "子项2" },
        ],
      },
    ]}
  />
</div>
```

### Single Items

展示无分组的单层菜单项列表，并使用 position static 静态定位。

```tsx
<div style={{ width: 200, height: 300 }}>
  <WrappedEoDirectory
    position="static"
    directoryTitle="单层目录"
    defaultSelectedKeys={["item1"]}
    menuItems={[
      { title: "菜单项1", type: "item", key: "item1" },
      { title: "菜单项2", type: "item", key: "item2" },
      { title: "菜单项3", type: "item", key: "item3" },
    ]}
    onMenuItemClick={(e) => console.log(e.detail)}
  />
</div>
```
