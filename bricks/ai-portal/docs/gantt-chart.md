构件 `ai-portal.gantt-chart`

## Examples

### Basic

```yaml preview
brick: ai-portal.gantt-chart
properties:
  chartTitle: Hello world
  nodes:
    - name: 整理产品业务相关知识
      state: completed
      children:
        - name: One
          startTime: 100
          endTime: 110
        - name: Two
    - name: 创建产品设计业务流
      state: working
      children:
        - name: 根据整理知识格式化为业务流定义
          state: completed
          children:
            - name: Three
        - name: 发起业务流：创建业务流
          state: working
          children:
            - name: 编写业务流
              state: completed
            - name: 管理员确认
              state: input-required
            - name: 保存业务流
              state: failed
            - name: 展示业务流
    # - name: 完成
```
