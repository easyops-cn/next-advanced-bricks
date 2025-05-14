构件 `nav.query-search`

## Examples

### Basic

```yaml preview
brick: div
properties:
  style:
    display: flex
    justify-content: space-between
children:
  - brick: div
    properties:
      style:
        background: red
        width: 100px
  - brick: div
    properties:
      style:
        display: flex
    children:
      - brick: nav.query-search
      - brick: eo-button
        properties:
          textContent: 通知
      - brick: eo-button
        properties:
          textContent: 告警
```
