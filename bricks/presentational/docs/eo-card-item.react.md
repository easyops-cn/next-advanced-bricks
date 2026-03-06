---
tagName: eo-card-item
displayName: WrappedEoCardItem
description: 信息类卡片 —— 通用卡片
category: card-info
source: "@next-bricks/presentational"
---

# WrappedEoCardItem

> 信息类卡片 —— 通用卡片

## 导入

```tsx
import { WrappedEoCardItem } from "@easyops/wrapped-components";
```

## Props

| 属性            | 类型                      | 必填 | 默认值     | 说明                                                                                                                                                  |
| --------------- | ------------------------- | ---- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| cardTitle       | `string`                  | 是   | -          | 卡片标题                                                                                                                                              |
| description     | `string`                  | 否   | -          | 描述信息                                                                                                                                              |
| hasHeader       | `boolean`                 | 否   | -          | 是否有顶部小标题区域，开启后会显示 `auxiliaryText` 辅助文字                                                                                           |
| auxiliaryText   | `string`                  | 否   | -          | 顶部辅助文字，在 `hasHeader` 为 `true` 时展示                                                                                                         |
| avatar          | `IconAvatar \| ImgAvatar` | 否   | -          | 图标或图片，支持图标头像（IconAvatar）和图片头像（ImgAvatar）两种形式                                                                                 |
| avatarPosition  | `"content" \| "cover"`    | 否   | -          | 头像的放置位置，设为 `cover` 时头像显示在封面区域，否则显示在内容区域                                                                                 |
| avatarPlacement | `"left" \| "title-left"`  | 否   | `"left"`   | 图标对齐方式，`left` 在内容左侧，`title-left` 紧靠标题左侧。`avatarPosition` 不为 `cover` 时有效                                                      |
| url             | `string \| object`        | 否   | -          | 链接地址，使用内部路由跳转                                                                                                                            |
| href            | `string`                  | 否   | -          | 设置后使用原生 `<a>` 标签跳转，通常用于外链                                                                                                           |
| target          | `string`                  | 否   | -          | 链接跳转目标，如 `_blank`                                                                                                                             |
| actions         | `ActionType[]`            | 否   | -          | 操作按钮组                                                                                                                                            |
| showActions     | `"always" \| "hover"`     | 否   | `"always"` | 操作按钮组的展示时机，`always` 始终展示，`hover` 悬停时展示                                                                                           |
| selected        | `boolean`                 | 否   | -          | 是否处于选中状态                                                                                                                                      |
| styleType       | `"grayish"`               | 否   | -          | 卡片样式类型，设为 `grayish` 时使用灰色调样式                                                                                                         |
| hasCover        | `boolean`                 | 否   | -          | 是否启用封面区域                                                                                                                                      |
| coverImage      | `string`                  | 否   | -          | 封面背景图片 URL                                                                                                                                      |
| coverColor      | `string`                  | 否   | -          | 封面纯色背景颜色                                                                                                                                      |
| coverImageSize  | `string`                  | 否   | -          | 封面图片尺寸，同 CSS `background-size`，参考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-size)                                  |
| tagConfig       | `TagConfig`               | 否   | -          | 徽标配置，可设置文本、图标、背景色和字体颜色。`bgColor` 支持预设色值（blue/cyan/geekblue/grayblue/gray/green/orange/purple/red/yellow）或自定义颜色值 |
| borderColor     | `string`                  | 否   | -          | 卡片边框颜色，支持预设色值（同 `tagConfig.bgColor`）或自定义颜色值                                                                                    |
| stacked         | `boolean`                 | 否   | -          | 是否展示堆叠效果（在卡片后方渲染两层装饰层）                                                                                                          |
| cardStyle       | `CSSProperties`           | 否   | -          | 卡片外层容器样式                                                                                                                                      |
| cardBodyStyle   | `CSSProperties`           | 否   | -          | 卡片内容区域样式                                                                                                                                      |
| cardTitleStyle  | `CSSProperties`           | 否   | -          | 卡片标题样式                                                                                                                                          |

## Events

| 事件          | detail             | 说明               |
| ------------- | ------------------ | ------------------ |
| onActionClick | `SimpleActionType` | 操作按钮点击时触发 |
| onTagClick    | -                  | 徽标点击时触发     |

## Slots

| 名称            | 说明                                                                  |
| --------------- | --------------------------------------------------------------------- |
| （默认）        | 内容区域，通常放置卡片自定义内容                                      |
| title-suffix    | 标题后缀区域，通常放置状态标签等内容                                  |
| expanded-area-1 | 扩展区域 1，通常放置标签信息                                          |
| expanded-area-2 | 扩展区域 2，通常放置操作和其他属性信息（图标/头像/小字描述/统计信息） |

## Examples

### Basic

展示带图标、描述、顶部辅助文字和操作按钮的基本卡片。

```tsx preview
<WrappedEoCardItem
  style={{ width: 300 }}
  hasHeader
  auxiliaryText="初级应用"
  cardTitle="资源监控微应用"
  description="资源监控微应用相关前后台"
  url="/test"
  target="_blank"
  avatar={{
    icon: { lib: "easyops", category: "default", icon: "monitor" },
    color: "#167be0",
    size: 20,
    bgColor: "var(--theme-geekblue-background)",
  }}
  actions={[
    {
      icon: { lib: "antd", theme: "outlined", icon: "star" },
      isDropdown: false,
      event: "collect",
    },
    {
      icon: { lib: "antd", icon: "copy", theme: "outlined" },
      text: "复制链接",
      isDropdown: true,
      event: "copy",
    },
    {
      icon: { lib: "antd", icon: "download", theme: "outlined" },
      text: "下载",
      isDropdown: true,
      disabled: true,
      event: "download",
    },
  ]}
/>
```

### showActions

通过 `showActions="hover"` 使操作按钮仅在鼠标悬停时显示。

```tsx preview
<WrappedEoCardItem
  style={{ width: 300 }}
  hasHeader
  auxiliaryText="初级应用"
  cardTitle="资源监控微应用"
  description="资源监控微应用相关前后台"
  avatar={{
    icon: { lib: "easyops", category: "default", icon: "monitor" },
    color: "#167be0",
    size: 20,
    bgColor: "var(--theme-geekblue-background)",
  }}
  actions={[
    {
      icon: { lib: "antd", theme: "outlined", icon: "star" },
      isDropdown: false,
      event: "collect",
    },
    {
      icon: { lib: "antd", icon: "copy", theme: "outlined" },
      text: "复制链接",
      isDropdown: true,
      event: "copy",
    },
    {
      icon: { lib: "antd", icon: "download", theme: "outlined" },
      text: "下载",
      isDropdown: true,
      disabled: true,
      event: "download",
    },
  ]}
  showActions="hover"
/>
```

### Cover

通过 `hasCover` 启用封面区域，可使用图片或纯色背景，并支持将头像放置在封面上。

```tsx preview
<div style={{ display: "flex", gap: 16 }}>
  <WrappedEoCardItem
    style={{ width: 280 }}
    hasCover
    coverImage="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
    cardTitle="信息卡片"
    description="这是一只可爱的北极熊"
    url="/test"
    target="_blank"
  />
  <WrappedEoCardItem
    style={{ width: 280 }}
    hasCover
    coverColor="#167be0"
    cardTitle="资源监控微应用"
    description="资源监控微应用相关前后台"
    url="/test"
    target="_blank"
    avatarPosition="cover"
    avatar={{
      icon: { lib: "easyops", category: "default", icon: "monitor" },
      color: "#fff",
    }}
    actions={[
      {
        icon: {
          lib: "antd",
          theme: "outlined",
          icon: "star",
          startColor: "#fff",
          endColor: "#fff",
        },
        isDropdown: false,
        event: "collect",
      },
      {
        icon: { lib: "antd", icon: "copy", theme: "outlined" },
        text: "复制链接",
        isDropdown: true,
        event: "copy",
      },
      {
        icon: { lib: "antd", icon: "download", theme: "outlined" },
        text: "下载",
        isDropdown: true,
        disabled: true,
        event: "download",
      },
    ]}
  />
</div>
```

### coverImageSize

通过 `coverImageSize` 控制封面图片的显示尺寸。

```tsx preview
<div style={{ display: "flex", gap: 16 }}>
  <WrappedEoCardItem
    style={{ width: 280 }}
    hasCover
    coverImage="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
    coverImageSize="cover"
    cardTitle="cover 模式"
    description="图片铺满封面区域"
  />
  <WrappedEoCardItem
    style={{ width: 280 }}
    hasCover
    coverImage="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
    coverImageSize="contain"
    cardTitle="contain 模式"
    description="图片完整显示在封面区域"
  />
</div>
```

### avatarPlacement

通过 `avatarPlacement="title-left"` 将图标紧靠标题左侧显示。

```tsx preview
<WrappedEoCardItem
  avatarPlacement="title-left"
  style={{ width: 300 }}
  cardTitle="资源监控微应用"
  description="资源监控微应用相关前后台"
  url="/test"
  target="_blank"
  avatar={{
    icon: { lib: "easyops", category: "default", icon: "monitor" },
  }}
/>
```

### selected

通过 `selected` 高亮选中状态，支持默认样式和 `grayish` 样式类型。

```tsx preview
<div style={{ display: "flex", gap: 16 }}>
  <WrappedEoCardItem
    selected
    style={{ width: 300 }}
    cardTitle="资源监控微应用"
    description="资源监控微应用相关前后台"
    avatar={{
      icon: { lib: "easyops", category: "default", icon: "monitor" },
      size: 20,
    }}
  />
  <WrappedEoCardItem
    styleType="grayish"
    selected
    style={{ width: 300 }}
    cardTitle="资源监控微应用"
    description="资源监控微应用相关前后台"
    avatar={{
      icon: { lib: "easyops", category: "default", icon: "monitor" },
      size: 20,
    }}
  />
</div>
```

### borderColor

通过 `borderColor` 设置卡片边框颜色，支持预设色值和自定义颜色，可配合 `selected` 使用。

```tsx preview
<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
  <WrappedEoCardItem
    borderColor="blue"
    style={{ width: 300 }}
    cardTitle="资源监控微应用"
    description="资源监控微应用相关前后台"
    avatar={{
      icon: { lib: "easyops", category: "default", icon: "monitor" },
      size: 20,
    }}
  />
  <WrappedEoCardItem
    borderColor="blue"
    selected
    style={{ width: 300 }}
    cardTitle="资源监控微应用"
    description="资源监控微应用相关前后台"
    avatar={{
      icon: { lib: "easyops", category: "default", icon: "monitor" },
      size: 20,
    }}
  />
</div>
```

### tagConfig

通过 `tagConfig` 在卡片右上角显示徽标，支持文字类型（`text`）和图标类型（`icon`），以及预设色值和自定义颜色。点击徽标触发 `onTagClick` 回调。

```tsx preview
function TagExample() {
  const [starred, setStarred] = React.useState(false);

  return (
    <>
      <div style={{ marginBottom: 10 }}>Text Tag</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        <WrappedEoCardItem
          tagConfig={{ text: "禁用", bgColor: "gray" }}
          cardTitle="资源监控微应用"
          description="资源监控微应用相关前后台"
        />
        <WrappedEoCardItem
          tagConfig={{ text: "蓝色", bgColor: "blue" }}
          cardTitle="资源监控微应用"
          description="资源监控微应用相关前后台"
        />
        <WrappedEoCardItem
          tagConfig={{ text: "绿色", bgColor: "green" }}
          cardTitle="资源监控微应用"
          description="资源监控微应用相关前后台"
        />
        <WrappedEoCardItem
          tagConfig={{
            text: "自定义",
            bgColor: "rgb(228 236 183)",
            color: "#000",
          }}
          cardTitle="资源监控微应用"
          description="资源监控微应用相关前后台"
        />
      </div>
      <div style={{ margin: 10 }}>Icon Tag</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        <WrappedEoCardItem
          tagConfig={{
            icon: { lib: "antd", icon: "info-circle", theme: "outlined" },
            bgColor: "blue",
          }}
          cardTitle="资源监控微应用"
          description="资源监控微应用相关前后台"
          url="/test"
          target="_blank"
        />
        <WrappedEoCardItem
          tagConfig={{
            icon: { lib: "antd", icon: "check-circle", theme: "outlined" },
            bgColor: "green",
          }}
          cardTitle="资源监控微应用"
          description="资源监控微应用相关前后台"
          url="/test"
          target="_blank"
        />
        <WrappedEoCardItem
          tagConfig={
            starred
              ? {
                  icon: {
                    lib: "antd",
                    icon: "star",
                    theme: "filled",
                    startColor: "yellow",
                    endColor: "yellow",
                  },
                  bgColor: "blue",
                }
              : {
                  icon: { lib: "antd", icon: "star", theme: "filled" },
                  bgColor: "blue",
                }
          }
          cardTitle="资源监控微应用"
          description="资源监控微应用相关前后台"
          url="/test"
          target="_blank"
          onTagClick={() => setStarred(true)}
        />
      </div>
    </>
  );
}
```

### styleType

使用 `styleType="grayish"` 展示灰色调卡片样式。

```tsx preview
<WrappedEoCardItem
  styleType="grayish"
  style={{ width: 300 }}
  cardTitle="资源监控微应用"
  description="资源监控微应用相关前后台"
  url="/test"
  target="_blank"
  avatar={{
    icon: { lib: "easyops", category: "default", icon: "monitor" },
    size: 20,
  }}
/>
```

### stacked

通过 `stacked` 为卡片添加堆叠视觉效果，适合表示卡片组。

```tsx preview
<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
  <WrappedEoCardItem
    stacked
    style={{ width: 300 }}
    cardTitle="资源监控微应用"
    description="资源监控微应用相关前后台"
    avatar={{
      icon: { lib: "easyops", category: "default", icon: "monitor" },
      size: 20,
    }}
  />
  <WrappedEoCardItem
    stacked
    styleType="grayish"
    style={{ width: 300 }}
    cardTitle="资源监控微应用"
    description="资源监控微应用相关前后台"
    avatar={{
      icon: { lib: "easyops", category: "default", icon: "monitor" },
      size: 20,
    }}
  />
  <WrappedEoCardItem
    stacked
    borderColor="blue"
    style={{ width: 300 }}
    cardTitle="资源监控微应用"
    description="资源监控微应用相关前后台"
    avatar={{
      icon: { lib: "easyops", category: "default", icon: "monitor" },
      size: 20,
    }}
  />
</div>
```

### cardStyle

通过 `cardStyle`、`cardBodyStyle`、`cardTitleStyle` 自定义卡片各区域的样式。

```tsx preview
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
  <WrappedEoCardItem
    style={{ width: 280 }}
    cardStyle={{ backgroundColor: "var(--palette-gray-blue-6)" }}
    cardTitle="自定义背景色"
    description="通过 cardStyle 设置卡片背景"
  />
  <WrappedEoCardItem
    style={{ width: 280 }}
    cardBodyStyle={{ padding: "20px 24px" }}
    cardTitleStyle={{ fontSize: 18, fontWeight: "bold" }}
    cardTitle="自定义内容区和标题样式"
    description="通过 cardBodyStyle 和 cardTitleStyle 调整布局"
  />
</div>
```

### Slots

利用 `title-suffix` 展示标题后缀标签，`expanded-area-1` 展示标签列表，`expanded-area-2` 展示底部操作栏。

```tsx preview
<WrappedEoCardItem
  style={{ width: 300 }}
  hasHeader
  auxiliaryText="初级应用"
  cardTitle="资源监控微应用"
  description="资源监控微应用相关前后台"
  avatar={{
    icon: { lib: "easyops", category: "default", icon: "monitor" },
    color: "#167be0",
    size: 20,
    bgColor: "var(--theme-geekblue-background)",
  }}
>
  <WrappedEoTag slot="title-suffix" color="green">
    已启用
  </WrappedEoTag>
  <WrappedEoTagList
    slot="expanded-area-1"
    size="small"
    list={[
      { text: "IT 资源管理", key: "IT_resource_management", color: "gray" },
      { text: "资源套餐", key: "resource_package", color: "gray" },
    ]}
  />
  <WrappedEoFlexLayout
    slot="expanded-area-2"
    style={{ width: "100%" }}
    justifyContent="space-between"
    alignItems="center"
  >
    <span style={{ color: "var(--text-color-secondary)" }}>
      张元 更新于 2 小时前
    </span>
    <WrappedEoSwitch size="small" />
  </WrappedEoFlexLayout>
</WrappedEoCardItem>
```

### onActionClick

监听 `onActionClick` 事件获取被点击的操作按钮信息。

```tsx preview
function ActionExample() {
  const [lastAction, setLastAction] = React.useState(null);

  return (
    <>
      {lastAction && (
        <div style={{ marginBottom: 8 }}>
          上次点击的操作：<strong>{lastAction.event}</strong>
        </div>
      )}
      <WrappedEoCardItem
        style={{ width: 300 }}
        cardTitle="资源监控微应用"
        description="资源监控微应用相关前后台"
        avatar={{
          icon: { lib: "easyops", category: "default", icon: "monitor" },
          size: 20,
        }}
        actions={[
          {
            icon: { lib: "antd", theme: "outlined", icon: "edit" },
            text: "编辑",
            isDropdown: true,
            event: "edit",
          },
          {
            icon: { lib: "antd", icon: "delete", theme: "outlined" },
            text: "删除",
            isDropdown: true,
            event: "delete",
          },
        ]}
        onActionClick={(action) => setLastAction(action)}
      />
    </>
  );
}
```
