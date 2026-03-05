---
tagName: ai-portal.show-cases
displayName: WrappedAiPortalShowCases
description: 案例列表展示构件，支持按场景分组筛选，展示多个优秀案例卡片。
category: ""
source: "@next-bricks/ai-portal"
---

# ai-portal.show-cases

> 案例列表展示构件，支持按场景分组筛选，展示多个优秀案例卡片。

## Props

| 属性  | 类型             | 必填 | 默认值 | 说明                                               |
| ----- | ---------------- | ---- | ------ | -------------------------------------------------- |
| list  | `ShowCaseType[]` | 否   | -      | 案例数据列表，每项可包含 scenario 字段用于分组筛选 |
| limit | `number`         | 否   | -      | 每个场景分组下最多显示的案例数量                   |

## Examples

### 基础使用

展示案例列表，自动按 scenario 字段生成分组筛选标签。

```yaml preview
brick: ai-portal.show-cases
properties:
  list:
    - conversationId: c-1
      title: 故障排查－操作系统内存高
      summary: 服务已经正常启动，正常运行，但用户在外部访问失败服务已经正常启动，正常运行但用户正常运行
      scenario: 主机故障排查
    - conversationId: c-2
      title: Hi
      summary: There
      scenario: 主机巡检
    - conversationId: c-3
      title: 磁盘空间不足处理
      summary: 磁盘使用率超过阈值的清理步骤
      scenario: 主机故障排查
```

### 限制显示数量

通过 limit 限制每个分组下最多显示的条数。

```yaml preview
brick: ai-portal.show-cases
properties:
  limit: 2
  list:
    - conversationId: c-1
      title: 案例一
      summary: 摘要一
      scenario: 场景A
    - conversationId: c-2
      title: 案例二
      summary: 摘要二
      scenario: 场景A
    - conversationId: c-3
      title: 案例三
      summary: 摘要三
      scenario: 场景A
    - conversationId: c-4
      title: 案例四
      summary: 摘要四
      scenario: 场景B
```
