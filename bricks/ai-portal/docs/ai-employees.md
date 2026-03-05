---
tagName: ai-portal.ai-employees
displayName: WrappedAiPortalAiEmployees
description: AI 数字人卡片列表，按行业和角色分组展示，支持 Tab 切换行业和点击跳转。
category: ai-portal
source: "@next-bricks/ai-portal"
---

# ai-portal.ai-employees

> AI 数字人卡片列表，按行业和角色分组展示，支持 Tab 切换行业和点击跳转。

## Props

| 属性        | 类型                      | 必填 | 默认值 | 说明                                                                    |
| ----------- | ------------------------- | ---- | ------ | ----------------------------------------------------------------------- |
| list        | `Employee[] \| undefined` | 否   | -      | 数字人列表数据                                                          |
| industries  | `string[] \| undefined`   | 否   | -      | 行业列表，用于指定 Tab 的顺序，未在此列表中的行业将按出现顺序附加在末尾 |
| urlTemplate | `string \| undefined`     | 否   | -      | 跳转到数字人详情页的 URL 模板，支持 {name} 等数字人字段插值             |
| stickyTop   | `number \| undefined`     | 否   | -      | 行业 Tab 栏吸顶时距顶部的距离（px），不设置则不吸顶                     |

## Examples

### Basic

展示 AI 数字人卡片列表，按行业 Tab 分组浏览。

```yaml preview
brick: ai-portal.ai-employees
properties:
  list:
    - name: 运维工程师小李
      industry: IT
      role: 运维专家
      description: 专注于服务器运维和故障处理。
    - name: 开发工程师小王
      industry: IT
      role: 开发专家
      description: 擅长全栈开发和架构设计。
    - name: 数据分析师小张
      industry: 金融
      role: 数据分析
      description: 专注于金融数据分析和风险评估。
```

### With URL Template

配置 urlTemplate 属性，使每个数字人卡片点击后跳转到对应详情页。

```yaml preview
brick: ai-portal.ai-employees
properties:
  urlTemplate: /employees/{name}
  list:
    - name: 运维工程师小李
      industry: IT
      role: 运维专家
      description: 专注于服务器运维和故障处理。
    - name: 开发工程师小王
      industry: IT
      role: 开发专家
      description: 擅长全栈开发和架构设计。
```

### With Industries and Sticky Tab

配置 industries 和 stickyTop 属性，控制行业 Tab 顺序及吸顶效果。

```yaml preview
brick: ai-portal.ai-employees
properties:
  industries:
    - 金融
    - IT
  stickyTop: 0
  list:
    - name: 数据分析师小张
      industry: 金融
      role: 数据分析
      description: 专注于金融数据分析和风险评估。
    - name: 运维工程师小李
      industry: IT
      role: 运维专家
      description: 专注于服务器运维和故障处理。
```
