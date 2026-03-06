---
tagName: eo-loading-step
displayName: WrappedEoLoadingStep
description: 加载步骤框。以全屏遮罩的形式展示多步骤加载进度，适用于系统初始化、批量操作等需要阻塞用户交互的场景。
category: ""
source: "@next-bricks/presentational"
---

# WrappedEoLoadingStep

> 加载步骤框。以全屏遮罩的形式展示多步骤加载进度，适用于系统初始化、批量操作等需要阻塞用户交互的场景。

## 导入

```tsx
import { WrappedEoLoadingStep } from "@easyops/wrapped-components";
```

## Props

| 属性      | 类型                      | 必填 | 默认值 | 说明                                                                                                                                     |
| --------- | ------------------------- | ---- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| visible   | `boolean \| undefined`    | 否   | -      | 是否可见。为 `true` 时展示全屏遮罩并锁定页面滚动，为 `false` 时隐藏遮罩并恢复滚动。                                                      |
| width     | `string \| undefined`     | 否   | -      | 容器宽度，支持任意 CSS 宽度值（如 `"400px"`、`"50%"`）。不设置时使用默认宽度。                                                           |
| stepTitle | `string \| undefined`     | 否   | -      | 步骤区域的标题文字，显示在步骤列表上方。                                                                                                 |
| stepList  | `StepItem[] \| undefined` | 否   | -      | 步骤列表，每项包含 `title`（显示名称）和 `key`（唯一标识）。步骤按数组顺序渲染。                                                         |
| curStep   | `string \| undefined`     | 否   | -      | 当前正在执行的步骤 `key`。key 对应的步骤显示为加载中（loading），之前的步骤显示为已完成（finished），之后的步骤显示为待执行（pending）。 |
| onOpen    | `() => void`              | 否   | -      | 调用 `open()` 方法后触发。                                                                                                               |
| onClose   | `() => void`              | 否   | -      | 调用 `close()` 方法后触发。                                                                                                              |

## Examples

### Basic

展示一个多步骤加载进度框，`curStep` 为第二步时，第一步显示为已完成，第二步显示为加载中，其余步骤显示为待执行。

```tsx preview minHeight="600px"
<WrappedEoLoadingStep
  visible={true}
  stepTitle="正在分析中"
  curStep="second"
  stepList={[
    { title: "正在从事件中获取资源信息...", key: "first" },
    { title: "事件资源获取成功。", key: "second" },
    { title: "正在匹配资源详情页...", key: "third" },
    { title: "已为您匹配到最佳资源详情页。", key: "fourth" },
    { title: "即将前往基础设施监控, 请等待...", key: "fifth" },
  ]}
/>
```

### Custom Width

通过 `width` 属性自定义容器宽度。

```tsx preview minHeight="600px"
<WrappedEoLoadingStep
  visible={true}
  width="480px"
  stepTitle="正在初始化系统"
  curStep="step1"
  stepList={[
    { title: "正在检查环境依赖...", key: "step1" },
    { title: "正在加载配置文件...", key: "step2" },
    { title: "正在启动核心服务...", key: "step3" },
  ]}
/>
```

### Open and Close via Methods

通过按钮调用 `open()` 和 `close()` 方法控制加载步骤框的显隐，并监听 `onOpen` 和 `onClose` 事件。

```tsx preview minHeight="100px"
function App() {
  const ref = React.useRef(null);
  const [log, setLog] = React.useState("");

  return (
    <div>
      <button onClick={() => ref.current?.open()} style={{ marginRight: 8 }}>
        打开加载框
      </button>
      <button onClick={() => ref.current?.close()}>关闭加载框</button>
      {log && <div style={{ marginTop: 8 }}>{log}</div>}
      <WrappedEoLoadingStep
        ref={ref}
        visible={false}
        stepTitle="正在批量处理数据"
        curStep="task2"
        stepList={[
          { title: "正在读取数据源...", key: "task1" },
          { title: "正在处理数据...", key: "task2" },
          { title: "正在写入结果...", key: "task3" },
        ]}
        onOpen={() => setLog("加载框已打开")}
        onClose={() => setLog("加载框已关闭")}
      />
    </div>
  );
}
```
