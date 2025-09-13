构件 `ai-portal.goal-card-list`

## Examples

### Basic

```yaml preview
brick: ai-portal.goal-card-list
properties:
  style:
    width: 600px
  goalList:
    - title: 页面流程绘制
      index: 100124
      state: ready
      instanceId: abc1
      conversations:
        - 会话1
        - 会话2
        - 会话3
    - title: 原型与设计绘制
      index: 100125
      state: working
      instanceId: bdc9
      conversations:
        - 会话4
    - title: 设计稿绘制
      index: 100126
      state: completed
      instanceId: d76a
      conversations:
        - 会话5
        - 会话6
```
