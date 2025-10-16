构件 `ai-portal.flow-tabs`

## Examples

### Basic

```yaml preview
brick: ai-portal.home-container
children:
  - brick: ai-portal.flow-tabs
    properties:
      textContent: Hello world
      tabs:
        - id: foo
          label: Fooooo
        - id: bar
          label: Baaaaar
        - id: baz
          label: Baaaaaz
      activeTab: foo
```
