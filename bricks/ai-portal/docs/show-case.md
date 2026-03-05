---
tagName: ai-portal.show-case
displayName: WrappedAiPortalShowCase
description: 案例展示卡片构件，以彩色背景卡片展示单个优秀案例，点击可跳转到案例详情。
category: ""
source: "@next-bricks/ai-portal"
---

# ai-portal.show-case

> 案例展示卡片构件，以彩色背景卡片展示单个优秀案例，点击可跳转到案例详情。

## Props

| 属性      | 类型     | 必填 | 默认值 | 说明                             |
| --------- | -------- | ---- | ------ | -------------------------------- |
| caseTitle | `string` | 否   | -      | 案例标题，同时用于计算卡片背景色 |
| summary   | `string` | 否   | -      | 案例摘要描述                     |
| url       | `string` | 否   | -      | 点击卡片跳转的目标链接           |

## Examples

### 基础使用

展示带标题、描述和跳转链接的案例卡片，背景色由标题内容决定。

```yaml preview
brick: ai-portal.show-case
properties:
  caseTitle: 故障排查－操作系统内存高
  summary: 服务已经正常启动，正常运行，但用户在外部访问失败服务已经正常启动，正常运行但用户正常运行
  url: "/cases/memory-issue"
```

### 多个卡片对比

不同标题产生不同背景色。

```yaml preview
brick: div
properties:
  style:
    display: flex
    gap: 16px
children:
  - brick: ai-portal.show-case
    properties:
      caseTitle: 故障排查－操作系统内存高
      summary: 内存使用率持续居高不下的排查与处理过程
  - brick: ai-portal.show-case
    properties:
      caseTitle: 主机磁盘空间不足
      summary: 磁盘使用率超过90%的清理与扩容方案
  - brick: ai-portal.show-case
    properties:
      caseTitle: 网络连通性异常分析
      summary: 服务间网络不通的问题定位与解决步骤
```
