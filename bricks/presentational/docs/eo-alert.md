---
tagName: eo-alert
displayName: WrappedEoAlert
description: 告警提示
category: display-component
source: "@next-bricks/presentational"
---

# eo-alert

> 告警提示

## Props

| 属性                | 类型                                          | 必填 | 默认值 | 说明                                                                                                            |
| ------------------- | --------------------------------------------- | ---- | ------ | --------------------------------------------------------------------------------------------------------------- |
| type                | `"success" \| "info" \| "warning" \| "error"` | 是   | -      | 警告类型                                                                                                        |
| hasTitle            | `boolean`                                     | 否   | -      | 是否显示标题。开启后，可以使用 `title` 插槽                                                                     |
| showIcon            | `boolean`                                     | 否   | -      | 是否显示提示图标                                                                                                |
| closable            | `boolean`                                     | 否   | -      | 是否显示关闭按钮                                                                                                |
| localStorageKey     | `string`                                      | 否   | -      | 以该值和页面 url 作为命名空间，决定是否显示该警告提示。关闭后将记录到 localStorage，下次访问同一 url 时不再显示 |
| disableUrlNamespace | `boolean`                                     | 否   | -      | 仅以 `localStorageKey` 作为命名空间（不拼接页面 url），关闭后在所有页面均不再显示                               |

## Slots

| 名称     | 说明                         |
| -------- | ---------------------------- |
| （默认） | 内容区                       |
| title    | 标题，需配合 `hasTitle` 使用 |

## Examples

### Basic

展示四种警告类型（`info`、`success`、`warning`、`error`），并启用关闭按钮。

```yaml preview
brick: div
properties:
  style:
    display: flex
    flex-direction: column
    gap: 10px
slots:
  "":
    type: bricks
    bricks:
      - brick: eo-alert
        properties:
          textContent: 你好！欢迎使用EasyOps 2.0专业版，你可以根据自身需求添加业务模块。
          type: info
          closable: true
      - brick: eo-alert
        properties:
          textContent: 恭喜！你所提交的信息已经审核通过。
          type: success
          closable: true
          showIcon: true
      - brick: eo-alert
        properties:
          textContent: "系统将于 15 : 00 - 17 : 00 进行升级，请及时保存你的资料！"
          type: warning
          closable: true
          showIcon: true
      - brick: eo-alert
        properties:
          textContent: 系统错误，请稍后重试。
          type: error
          closable: true
          showIcon: true
```

### HasTitle

通过 `hasTitle` 启用标题区域，并使用 `title` 插槽放置标题内容。

```yaml preview
brick: div
properties:
  style:
    display: flex
    flex-direction: column
    gap: 10px
slots:
  "":
    type: bricks
    bricks:
      - brick: eo-alert
        properties:
          textContent: 你好，由于你的良好信用，我们决定赠送你三个月产品会员，欲了解会员特权与活动请进首页会员专区查看。
          type: info
          closable: true
          hasTitle: true
          showIcon: true
        slots:
          title:
            type: bricks
            bricks:
              - brick: div
                properties:
                  textContent: 帮助信息
      - brick: eo-alert
        properties:
          textContent: 你所提交的审核信息已全部通过审核，请及时跟进申请状况。
          type: success
          closable: true
          hasTitle: true
          showIcon: true
        slots:
          title:
            type: bricks
            bricks:
              - brick: div
                properties:
                  textContent: 已成功
      - brick: eo-alert
        properties:
          textContent: 你所提交的审核信息审核失败，可以进入个人信箱查看原因。如有疑问，请联系客服人员。
          type: warning
          closable: true
          hasTitle: true
          showIcon: true
        slots:
          title:
            type: bricks
            bricks:
              - brick: div
                properties:
                  textContent: 请注意
      - brick: eo-alert
        properties:
          textContent: 你的账户会员使用权限将在3天后到期，请及时跟进申请状况，如有疑问，请联系审核人员。
          type: error
          closable: true
          hasTitle: true
          showIcon: true
        slots:
          title:
            type: bricks
            bricks:
              - brick: div
                properties:
                  textContent: 出错了
```

### LocalStorageKey

通过 `localStorageKey` 和 `disableUrlNamespace` 控制关闭后的持久化范围：`disableUrlNamespace` 为 `true` 时，关闭后在所有页面均不再显示；否则仅在当前 url 下不再显示。

```yaml preview
brick: div
properties:
  style:
    display: flex
    flex-direction: column
    gap: 10px
slots:
  "":
    type: bricks
    bricks:
      - brick: eo-alert
        properties:
          textContent: 关闭后仅在当前页面不再显示（localStorageKey + url 命名空间）。
          type: info
          closable: true
          showIcon: true
          localStorageKey: demo-alert-url
      - brick: eo-alert
        properties:
          textContent: 关闭后在所有页面均不再显示（仅 localStorageKey 命名空间）。
          type: warning
          closable: true
          showIcon: true
          localStorageKey: demo-alert-global
          disableUrlNamespace: true
```
