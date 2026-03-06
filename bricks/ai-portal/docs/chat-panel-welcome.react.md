---
tagName: ai-portal.chat-panel-welcome
displayName: WrappedAiPortalChatPanelWelcome
description: 聊天面板欢迎语构件，展示带有 Elevo 头像的欢迎消息。
category: ""
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalChatPanelWelcome

> 聊天面板欢迎语构件，展示带有 Elevo 头像的欢迎消息。

## 导入

```tsx
import { WrappedAiPortalChatPanelWelcome } from "@easyops/wrapped-components";
```

## Props

| 属性 | 类型     | 必填 | 默认值 | 说明           |
| ---- | -------- | ---- | ------ | -------------- |
| text | `string` | 否   | -      | 欢迎语文本内容 |

## Examples

### 基础使用

展示带 Elevo 头像和欢迎语文本的欢迎消息。

```tsx
<WrappedAiPortalChatPanelWelcome text="你好！我是 Elevo，你的 AI 助手。有什么可以帮助你的吗？" />
```

### 自定义欢迎语

根据业务场景配置个性化的欢迎文案。

```tsx
<WrappedAiPortalChatPanelWelcome text="欢迎来到产品设计空间！我可以帮助你进行需求分析、流程设计和问题排查。" />
```
