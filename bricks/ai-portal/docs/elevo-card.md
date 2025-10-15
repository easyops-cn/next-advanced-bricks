构件 `ai-portal.elevo-card`

## Examples

### Basic

```yaml preview
brick: ai-portal.home-container
children:
  - brick: ai-portal.elevo-card
    properties:
      cardTitle: HR
      description: Provide standard HR workflows. e.g. leave applications, office supply requistion, purchase requistion, etc.
      style:
        maxWidth: 400px
    children:
      - brick: eo-dropdown-actions
        slot: actions
        properties:
          themeVariant: elevo
          actions:
            - text: Edit
              event: edit
            - text: Delete
              event: delete
              danger: true
        children:
          - brick: ai-portal.icon-button
            properties:
              variant: mini
              icon:
                lib: antd
                icon: setting
      - brick: eo-button
        slot: footer
        properties:
          themeVariant: elevo
          textContent: Chat
          type: flat
```
