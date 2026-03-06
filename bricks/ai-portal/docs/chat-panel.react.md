---
tagName: ai-portal.chat-panel
displayName: WrappedAiPortalChatPanel
description: 弹出式 AI 对话面板，以模态框形式展示对话界面，支持与 AI 助手进行多轮对话。
category: ai-portal
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalChatPanel

> 弹出式 AI 对话面板，以模态框形式展示对话界面，支持与 AI 助手进行多轮对话。

## 导入

```tsx
import { WrappedAiPortalChatPanel } from "@easyops/wrapped-components";
```

## Props

| 属性          | 类型                                      | 必填 | 默认值  | 说明                                 |
| ------------- | ----------------------------------------- | ---- | ------- | ------------------------------------ |
| panelTitle    | `string \| undefined`                     | 否   | -       | 面板标题                             |
| aiEmployeeId  | `string \| undefined`                     | 否   | -       | 预设数字人 ID，对话提交时会携带该 ID |
| cmd           | `CommandPayload \| undefined`             | 否   | -       | 预设命令载荷，对话提交时会携带该命令 |
| width         | `string \| number \| undefined`           | 否   | -       | 面板宽度                             |
| height        | `string \| number \| undefined`           | 否   | -       | 面板高度                             |
| placeholder   | `string \| undefined`                     | 否   | -       | 输入框占位文字                       |
| uploadOptions | `UploadOptions \| undefined`              | 否   | -       | 文件上传配置                         |
| help          | `{ useBrick: UseBrickConf } \| undefined` | 否   | -       | 无对话时显示的帮助内容配置           |
| maskClosable  | `boolean \| undefined`                    | 否   | `false` | 是否点击遮罩关闭面板                 |

## Methods

| 方法          | 参数                             | 返回值 | 说明                 |
| ------------- | -------------------------------- | ------ | -------------------- |
| open          | `() => void`                     | `void` | 打开对话面板         |
| close         | `() => void`                     | `void` | 关闭对话面板         |
| setInputValue | `(content: string) => void`      | `void` | 设置输入框的内容     |
| send          | `(payload: ChatPayload) => void` | `void` | 直接发送一条消息     |
| showFile      | `(file: FileInfo) => void`       | `void` | 在面板中显示文件预览 |

## Examples

### Basic

通过按钮触发打开 AI 对话面板。

```tsx
const ref = useRef<any>();

<>
  <button onClick={() => ref.current?.open()}>打开对话面板</button>
  <WrappedAiPortalChatPanel
    ref={ref}
    width={600}
    height={800}
    panelTitle="AI 助手"
    placeholder="请输入您的问题..."
  />
</>;
```

### With Upload Options

配置文件上传功能的对话面板。

```tsx
const ref = useRef<any>();

<>
  <button onClick={() => ref.current?.open()}>打开对话面板</button>
  <WrappedAiPortalChatPanel
    ref={ref}
    panelTitle="AI 文档助手"
    placeholder="请上传文件或输入问题"
    maskClosable={true}
    uploadOptions={{
      enabled: true,
      accept: ".pdf,.docx",
      maxFiles: 3,
      readableAccept: "PDF 或 Word 文档",
    }}
  />
</>;
```

### Programmatic Send

通过调用 send 方法直接发起对话。

```tsx
const ref = useRef<any>();

const handleAnalyze = () => {
  ref.current?.open();
  ref.current?.send({ content: "请帮我分析当前系统的性能瓶颈" });
};

<>
  <button onClick={handleAnalyze}>发起分析请求</button>
  <WrappedAiPortalChatPanel
    ref={ref}
    panelTitle="AI 分析助手"
    width={700}
    height={600}
  />
</>;
```
