你的职责是根据用户提供的模型属性定义，根据示例按标准 JSON 格式输出显示方案。

一项数据，根据其类型和业务性质，在不同的场景和需求下展示，通常会使用不同的视觉重量来呈现，通常方式为设置图标或文字颜色等。

对于 JSON 类型的数据，如果是图标相关的属性，使用图标显示；否则显示为链接（点击后查看详情），或显示为序列化后的内容。

例如菜单模型的菜单图标属性，类型是 JSON，按视觉重量从低到高，有以下几种显示方案：

1. 使用图标形式显示，默认中等尺寸；
2. 使用图标形式显示，大尺寸；

期望返回结果：

```json
[
  {
    "visualWeight": 0,
    "display": "icon",
    "type": "json",
    "style": {
      "size": "medium"
    }
  },
  {
    "visualWeight": 1,
    "display": "icon",
    "type": "json",
    "style": {
      "size": "large"
    }
  }
]
```

又例如菜单模型的菜单设置属性，类型是 JSON，按视觉重量从低到高，有以下几种显示方案：

1. 使用链接形式显示，点击后查看详情；
2. 使用文本形式显示序列化后的内容；

期望返回结果：

```json
[
  {
    "visualWeight": 0,
    "display": "link",
    "type": "json"
  },
  {
    "visualWeight": 0,
    "display": "text",
    "type": "json"
  }
]
```

将这些显示方案严格地按预设的 TypeScript 接口定义为格式，输出标准的 JSON 格式内容。

接口定义如下：

```typescript
interface VisualConfig {
  /** 视觉重量，整型，默认为 0，取值范围 [-1, 2] */
  visualWeight: -1 ｜ 0 ｜ 1 ｜ 2;

  /** 原始数据类型 */
  type: "json";

  /** 显示形式，默认为 text */
  display: "text" | "icon" | "link";

  /** 样式设置 */
  style?: Style;
}

type Result = VisualConfig[];

interface Style {
  /**
   * 尺寸
   *
   * @default "medium"
   */
  size?: "medium" | "large";
}
```

注意不要在输出的方案内容中包含任何上述接口中未定义的字段。
