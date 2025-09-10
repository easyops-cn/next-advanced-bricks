构件 `ai-portal.dropdown-select`

下拉选择器组件，提供选项列表供用户选择，支持搜索过滤功能。

## Examples

### Basic

基础用法，提供选项列表：

```yaml preview
brick: ai-portal.dropdown-select
properties:
  options:
    - label: "选项1"
      value: "option1"
    - label: "选项2"
      value: "option2"
    - label: "选项3"
      value: "option3"
  value: "option1"
events:
  change:
    action: "console.log"
```

### With Search

启用搜索功能：

```yaml preview
brick: ai-portal.dropdown-select
properties:
  showSearch: true
  searchPlaceholder: "请输入关键词搜索"
  options:
    - label: "北京市"
      value: "beijing"
    - label: "上海市"
      value: "shanghai"
    - label: "广州市"
      value: "guangzhou"
    - label: "深圳市"
      value: "shenzhen"
    - label: "杭州市"
      value: "hangzhou"
events:
  change:
    action: "console.log"
```

### Loading State

加载状态显示：

```yaml preview
brick: ai-portal.dropdown-select
properties:
  loading: true
  options:
    - label: "加载中..."
      value: "loading"
events:
  change:
    action: "console.log"
```

### Custom Width

自定义标签和下拉框宽度：

```yaml preview
brick: ai-portal.dropdown-select
properties:
  labelMaxWidth: "150px"
  dropdownMaxWidth: "300px"
  options:
    - label: "这是一个很长的选项标签文本"
      value: "long-option"
    - label: "短选项"
      value: "short"
    - label: "中等长度的选项"
      value: "medium"
  value: "long-option"
events:
  change:
    action: "console.log"
```

### With Disabled Options

包含禁用选项：

```yaml preview
brick: ai-portal.dropdown-select
properties:
  options:
    - label: "可用选项1"
      value: "enabled1"
    - label: "禁用选项"
      value: "disabled1"
      disabled: true
    - label: "可用选项2"
      value: "enabled2"
    - label: "禁用选项2"
      value: "disabled2"
      disabled: true
events:
  change:
    action: "console.log"
```

### Complex Example

综合示例，包含所有功能：

```yaml preview
brick: ai-portal.dropdown-select
properties:
  value: "frontend"
  showSearch: true
  searchPlaceholder: "搜索技术栈"
  labelMaxWidth: "200px"
  dropdownMaxWidth: "400px"
  options:
    - label: "前端开发 - React"
      value: "frontend"
    - label: "后端开发 - Node.js"
      value: "backend"
    - label: "移动开发 - React Native"
      value: "mobile"
    - label: "数据库 - MongoDB"
      value: "database"
    - label: "DevOps - Docker"
      value: "devops"
      disabled: true
    - label: "机器学习 - Python"
      value: "ml"
    - label: "云计算 - AWS"
      value: "cloud"
events:
  change:
    - action: "console.log"
      args:
        - "选择了："
        - "<% EVENT.detail %>"
```
