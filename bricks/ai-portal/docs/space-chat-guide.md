---
tagName: ai-portal.space-chat-guide
displayName: WrappedAiPortalSpaceChatGuide
description: 空间聊天引导构件，根据空间详情展示引导信息，帮助用户快速开始聊天。
category: ""
source: "@next-bricks/ai-portal"
---

# ai-portal.space-chat-guide

> 空间聊天引导构件，根据空间详情展示引导信息，帮助用户快速开始聊天。

## Props

| 属性        | 类型          | 必填 | 默认值 | 说明                                           |
| ----------- | ------------- | ---- | ------ | ---------------------------------------------- |
| spaceDetail | `SpaceDetail` | 是   | -      | 空间详情信息，必填，用于展示空间相关的引导内容 |

## Examples

### 基础使用

根据空间详情展示聊天引导内容。

```yaml preview
brick: ai-portal.space-chat-guide
properties:
  spaceDetail:
    name: "产品设计空间"
    instanceId: "space-001"
    description: "这是一个用于产品设计协作的空间"
```
