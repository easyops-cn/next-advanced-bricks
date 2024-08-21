构件 `visual-builder.raw-data-preview`

```yaml preview minHeight="500px"
brick: visual-builder.raw-data-preview
properties:
  previewUrl: /preview/
  theme: <% THEME.getTheme() %>
  uiVersion: "8.2"
  style:
    height: calc(100vh - 4em)
  generations:
    - generationId: 6202dcb92c165
      objectId: IDEA
      objectName: 想法
      propertyId: predictDeliveryTime
      propertyName: 预计交付时间
      propertyInstanceId: 61df43df88cc1
      instanceId: 6202dcb92c165
      candidates:
        - display: text
          formatter:
            format: relative
            type: date-time
          type: date-time
          visualWeight: -1
        - display: text
          formatter:
            format: accurate
            type: date-time
          type: date-time
          visualWeight: 0
        - display: text
          formatter:
            format: full
            type: date-time
          type: date-time
          visualWeight: 1
        - display: text
          formatter:
            format: full
            type: date-time
          type: date-time
          visualWeight: 2
    - generationId: 6202d9c17c601
      objectId: IDEA
      objectName: 想法
      propertyId: gradeInfo
      propertyName: 评价信息
      propertyInstanceId: 61df43df88d25
      instanceId: 6202d9c17c601
      candidates:
        - display: text
          field: grade
          type: struct
          visualWeight: 0
        - display: link
          field: memo
          type: struct
          visualWeight: 1
        - display: tag
          field: gradeTime
          type: struct
          visualWeight: 2
    - generationId: 6202d9c1824ed
      objectId: IDEA
      objectName: 想法
      propertyId: createRole
      propertyName: 创建idea的用户角色
      propertyInstanceId: 61df43df88d89
      instanceId: 6202d9c1824ed
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202d9c17d9ed
      objectId: IDEA
      objectName: 想法
      propertyId: pmoReviewComment
      propertyName: PMO评审意见
      propertyInstanceId: 61df43df88ded
      instanceId: 6202d9c17d9ed
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202d9c17d8c1
      objectId: IDEA
      objectName: 想法
      propertyId: value
      propertyName: 想法价值
      propertyInstanceId: 61df43df88e51
      instanceId: 6202d9c17d8c1
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202dcb90ef61
      objectId: IDEA
      objectName: 想法
      propertyId: planStartDate
      propertyName: 计划开始日期
      propertyInstanceId: 61df43df88eb5
      instanceId: 6202dcb90ef61
      candidates:
        - display: text
          formatter:
            format: relative
            type: date
          type: date
          visualWeight: -1
        - display: text
          formatter:
            format: accurate
            type: date
          type: date
          visualWeight: 0
        - display: text
          formatter:
            format: full
            type: date
          type: date
          visualWeight: 1
        - display: text
          formatter:
            format: full
            type: date
          type: date
          visualWeight: 2
    - generationId: 6202dcb90c081
      objectId: IDEA
      objectName: 想法
      propertyId: planStartTime
      propertyName: 计划开始时间
      propertyInstanceId: 61df43df88f19
      instanceId: 6202dcb90c081
      candidates:
        - display: text
          formatter:
            format: relative
            type: date-time
          type: date-time
          visualWeight: -1
        - display: text
          formatter:
            format: accurate
            type: date-time
          type: date-time
          visualWeight: 0
        - display: text
          formatter:
            format: full
            type: date-time
          type: date-time
          visualWeight: 1
        - display: text
          formatter:
            format: full
            type: date-time
          type: date-time
          visualWeight: 2
    - generationId: 6202d9c198f09
      objectId: IDEA
      objectName: 想法
      propertyId: stage
      propertyName: 项目阶段
      propertyInstanceId: 61df43df88f7d
      instanceId: 6202d9c198f09
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202dcb94428d
      objectId: IDEA
      objectName: 想法
      propertyId: pmoReviewTime
      propertyName: PMO评审时间
      propertyInstanceId: 61df43df88fe1
      instanceId: 6202dcb94428d
      candidates:
        - display: text
          formatter:
            format: relative
            type: date-time
          type: date-time
          visualWeight: -1
        - display: text
          formatter:
            format: accurate
            type: date-time
          type: date-time
          visualWeight: 0
        - display: text
          formatter:
            format: full
            type: date-time
          type: date-time
          visualWeight: 1
        - display: text
          formatter:
            format: full
            type: date-time
          type: date-time
          visualWeight: 2
    - generationId: 6202d9c19ac55
      objectId: IDEA
      objectName: 想法
      propertyId: customerConfirm
      propertyName: 客户确认情况
      propertyInstanceId: 61df43df89045
      instanceId: 6202d9c19ac55
      candidates:
        - display: text
          field: confirm
          type: struct
          visualWeight: 0
        - display: link
          field: confirmTime
          type: struct
          visualWeight: 1
        - display: tag
          field: rejectReason
          type: struct
          visualWeight: 2
        - display: text
          field: confirmTime
          type: struct
          visualWeight: -1
    - generationId: 6202d9c1a1825
      objectId: IDEA
      objectName: 想法
      propertyId: finishTime
      propertyName: 结束时间
      propertyInstanceId: 61df43df890a9
      instanceId: 6202d9c1a1825
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202dcb90eefd
      objectId: IDEA
      objectName: 想法
      propertyId: pdReviewDate
      propertyName: PD评审日期
      propertyInstanceId: 61df43df8910d
      instanceId: 6202dcb90eefd
      candidates:
        - display: text
          formatter:
            format: relative
            type: date
          type: date
          visualWeight: -1
        - display: text
          formatter:
            format: accurate
            type: date
          type: date
          visualWeight: 0
        - display: text
          formatter:
            format: full
            type: date
          type: date
          visualWeight: 1
        - display: text
          formatter:
            format: full
            type: date
          type: date
          visualWeight: 2
    - generationId: 6202d9c1b5e51
      objectId: IDEA
      objectName: 想法
      propertyId: realStoryPoint
      propertyName: 实际消耗人天
      propertyInstanceId: 61df43df89171
      instanceId: 6202d9c1b5e51
      candidates:
        - display: text
          formatter:
            decimals: 2
            format: decimal
            type: number
          style:
            color: var(--text-color-secondary)
            size: medium
          type: float
          visualWeight: -1
        - display: text
          formatter:
            decimals: 2
            format: decimal
            type: number
          style:
            color: var(--text-color-default)
            size: medium
          type: float
          visualWeight: 0
        - display: text
          formatter:
            decimals: 2
            format: decimal
            type: number
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: float
          visualWeight: 1
        - display: text
          formatter:
            decimals: 2
            format: decimal
            type: number
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: float
          visualWeight: 2
    - generationId: 6202d9c1b7369
      objectId: IDEA
      objectName: 想法
      propertyId: document
      propertyName: 文档链接
      propertyInstanceId: 61df43df891d5
      instanceId: 6202d9c1b7369
      candidates:
        - display: text
          field: developUrl
          type: struct
          visualWeight: 0
        - display: link
          field: developUrl
          type: struct
          visualWeight: 1
        - display: link
          field: requirementUrl
          type: struct
          visualWeight: 2
    - generationId: 6202d9c1bcc79
      objectId: IDEA
      objectName: 想法
      propertyId: op_plan_month
      propertyName: 是否是运营每月10个需求
      propertyInstanceId: 61df43df89239
      instanceId: 6202d9c1bcc79
      candidates:
        - display: text
          "false":
            style:
              color: var(--text-color-default)
            text: N
          "true":
            style:
              color: var(--text-color-default)
            text: Y
          type: boolean
          visualWeight: -1
        - display: icon
          "false":
            icon: xmark
            style:
              color: var(--color-error)
          "true":
            icon: check
            style:
              color: var(--color-success)
          type: boolean
          visualWeight: 0
        - display: icon+text
          "false":
            icon: xmark
            style:
              color: var(--color-error)
            text: 否
          "true":
            icon: check
            style:
              color: var(--color-success)
            text: 是
          type: boolean
          visualWeight: 1
        - display: icon+text
          "false":
            icon: xmark
            style:
              color: var(--color-error)
              fontWeight: bold
            text: 非运营每月10个需求
          "true":
            icon: check
            style:
              color: var(--color-success)
              fontWeight: bold
            text: 是运营每月10个需求
          type: boolean
          visualWeight: 2
    - generationId: 6202d9c1c0905
      objectId: IDEA
      objectName: 想法
      propertyId: pmoReviewResult
      propertyName: PMO评审结果
      propertyInstanceId: 61df43df8929d
      instanceId: 6202d9c1c0905
      candidates:
        - display: text
          "false":
            style:
              color: var(--text-color-default)
            text: 未通过
          "true":
            style:
              color: var(--text-color-default)
            text: 通过
          type: boolean
          visualWeight: -1
        - display: icon
          "false":
            icon: xmark
            style:
              color: var(--color-error)
          "true":
            icon: check
            style:
              color: var(--color-success)
          type: boolean
          visualWeight: 0
        - display: icon+text
          "false":
            icon: xmark
            style:
              color: var(--color-error)
            text: 未通过
          "true":
            icon: check
            style:
              color: var(--color-success)
            text: 通过
          type: boolean
          visualWeight: 1
        - display: icon+text
          "false":
            icon: xmark
            style:
              color: var(--color-error)
              fontWeight: bold
            text: PMO评审未通过
          "true":
            icon: check
            style:
              color: var(--color-success)
              fontWeight: bold
            text: PMO评审已通过
          type: boolean
          visualWeight: 2
    - generationId: 6202d9c1bd8f9
      objectId: IDEA
      objectName: 想法
      propertyId: score
      propertyName: 需求得分
      propertyInstanceId: 61df43df89301
      instanceId: 6202d9c1bd8f9
      candidates:
        - display: text
          formatter:
            decimals: 1
            format: decimal
            type: number
          style:
            color: var(--text-color-secondary)
            size: medium
          type: float
          visualWeight: -1
        - display: text
          formatter:
            decimals: 2
            format: decimal
            type: number
          style:
            color: var(--text-color-default)
            size: medium
          type: float
          visualWeight: 0
        - display: text
          formatter:
            decimals: 2
            format: decimal
            type: number
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: float
          visualWeight: 1
        - display: text
          formatter:
            decimals: 2
            format: decimal
            type: number
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: float
          visualWeight: 2
    - generationId: 6202d9c1c6085
      objectId: IDEA
      objectName: 想法
      propertyId: description
      propertyName: 面临/希望解决的问题
      propertyInstanceId: 61df43df89365
      instanceId: 6202d9c1c6085
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202d9c1ccc55
      objectId: IDEA
      objectName: 想法
      propertyId: number
      propertyName: 序号
      propertyInstanceId: 61df43df893c9
      instanceId: 6202d9c1ccc55
      candidates:
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202d9c1d631d
      objectId: IDEA
      objectName: 想法
      propertyId: source
      propertyName: 客户来源(微信端传参)
      propertyInstanceId: 61df43df8942d
      instanceId: 6202d9c1d631d
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202d9c1d7a8d
      objectId: IDEA
      objectName: 想法
      propertyId: category
      propertyName: 想法分类
      propertyInstanceId: 61df43df89491
      instanceId: 6202d9c1d7a8d
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: enum
          visualWeight: -1
        - display: tag
          style:
            palette:
              displaceRequirements: green
              functionalRequirements: blue
              instructionsRequirementsDefinition: orange
              optimizedRequirements: purple
              performance: red
              sowClearRequirementsDefinition: gray
            variant: default
          type: enum
          visualWeight: 0
        - display: tag
          style:
            palette:
              displaceRequirements: green
              functionalRequirements: blue
              instructionsRequirementsDefinition: orange
              optimizedRequirements: purple
              performance: red
              sowClearRequirementsDefinition: gray
            variant: outline
          type: enum
          visualWeight: 1
        - display: tag
          style:
            palette:
              displaceRequirements: green
              functionalRequirements: blue
              instructionsRequirementsDefinition: orange
              optimizedRequirements: purple
              performance: red
              sowClearRequirementsDefinition: gray
            variant: background
          type: enum
          visualWeight: 2
    - generationId: 6202d9c1db1a1
      objectId: IDEA
      objectName: 想法
      propertyId: deliveryStatus
      propertyName: 交付验收状态
      propertyInstanceId: 61df43df894f5
      instanceId: 6202d9c1db1a1
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: enum
          visualWeight: -1
        - display: tag
          style:
            palette:
              passed: green
              unconfirmed: gray
              unpassed: red
            variant: default
          type: enum
          visualWeight: 0
        - display: tag
          style:
            palette:
              passed: green
              unconfirmed: gray
              unpassed: red
            variant: outline
          type: enum
          visualWeight: 1
        - display: tag
          style:
            palette:
              passed: green
              unconfirmed: gray
              unpassed: red
            variant: background
          type: enum
          visualWeight: 2
    - generationId: 6202dcb90e40d
      objectId: IDEA
      objectName: 想法
      propertyId: startDate
      propertyName: 开始时间
      propertyInstanceId: 61df43df89559
      instanceId: 6202dcb90e40d
      candidates:
        - display: text
          formatter:
            format: relative
            type: date
          type: date
          visualWeight: -1
        - display: text
          formatter:
            format: accurate
            type: date
          type: date
          visualWeight: 0
        - display: text
          formatter:
            format: full
            type: date
          type: date
          visualWeight: 1
        - display: text
          formatter:
            format: full
            type: date
          type: date
          visualWeight: 2
    - generationId: 6202d9c1dd8b1
      objectId: IDEA
      objectName: 想法
      propertyId: resolveTime
      propertyName: 解决时间
      propertyInstanceId: 61df43df895bd
      instanceId: 6202d9c1dd8b1
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202d9c1ea9ad
      objectId: IDEA
      objectName: 想法
      propertyId: classification
      propertyName: 想法类型
      propertyInstanceId: 61df43df89621
      instanceId: 6202d9c1ea9ad
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: enum
          visualWeight: -1
        - display: tag
          style:
            palette:
              deliveryCustomization: purple
              feature: blue
              optimization: green
              requirement: orange
            variant: default
          type: enum
          visualWeight: 0
        - display: tag
          style:
            palette:
              deliveryCustomization: purple
              feature: blue
              optimization: green
              requirement: orange
            variant: outline
          type: enum
          visualWeight: 1
        - display: tag
          style:
            palette:
              deliveryCustomization: purple
              feature: blue
              optimization: green
              requirement: orange
            variant: background
          type: enum
          visualWeight: 2
    - generationId: 6202d9c1f6e8d
      objectId: IDEA
      objectName: 想法
      propertyId: pdReviewResult
      propertyName: PD评审结果
      propertyInstanceId: 61df43df89685
      instanceId: 6202d9c1f6e8d
      candidates:
        - display: text
          "false":
            style:
              color: var(--text-color-default)
            text: 未通过
          "true":
            style:
              color: var(--text-color-default)
            text: 通过
          type: boolean
          visualWeight: -1
        - display: icon
          "false":
            icon: xmark
            style:
              color: var(--color-error)
          "true":
            icon: check
            style:
              color: var(--color-success)
          type: boolean
          visualWeight: 0
        - display: icon+text
          "false":
            icon: xmark
            style:
              color: var(--color-error)
            text: 未通过
          "true":
            icon: check
            style:
              color: var(--color-success)
            text: 通过
          type: boolean
          visualWeight: 1
        - display: icon+text
          "false":
            icon: xmark
            style:
              color: var(--color-error)
              fontWeight: bold
              size: large
            text: 未通过
          "true":
            icon: check
            style:
              color: var(--color-success)
              fontWeight: bold
              size: large
            text: 通过
          type: boolean
          visualWeight: 2
    - generationId: 6202d9c200cc1
      objectId: IDEA
      objectName: 想法
      propertyId: closeReason
      propertyName: 关闭原因
      propertyInstanceId: 61df43df896e9
      instanceId: 6202d9c200cc1
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202d9c1f7bd5
      objectId: IDEA
      objectName: 想法
      propertyId: confirmUrl
      propertyName: 验收链接
      propertyInstanceId: 61df43df8974d
      instanceId: 6202d9c1f7bd5
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202d9c200d89
      objectId: IDEA
      objectName: 想法
      propertyId: deliveryConfirm
      propertyName: 交付确认
      propertyInstanceId: 61df43df897b1
      instanceId: 6202d9c200d89
      candidates:
        - display: text
          "false":
            style:
              color: var(--text-color-default)
            text: N
          "true":
            style:
              color: var(--text-color-default)
            text: Y
          type: boolean
          visualWeight: -1
        - display: icon
          "false":
            icon: xmark
            style:
              color: var(--color-error)
          "true":
            icon: check
            style:
              color: var(--color-success)
          type: boolean
          visualWeight: 0
        - display: icon+text
          "false":
            icon: xmark
            style:
              color: var(--color-error)
            text: Not Confirmed
          "true":
            icon: check
            style:
              color: var(--color-success)
            text: Confirmed
          type: boolean
          visualWeight: 1
        - display: icon+text
          "false":
            icon: xmark
            style:
              color: var(--color-error)
              fontWeight: bold
              size: large
            text: Not Confirmed
          "true":
            icon: check
            style:
              color: var(--color-success)
              fontWeight: bold
              size: large
            text: Confirmed
          type: boolean
          visualWeight: 2
    - generationId: 6202d9c2066fd
      objectId: IDEA
      objectName: 想法
      propertyId: humanCost
      propertyName: 人力评估
      propertyInstanceId: 61df43df89815
      instanceId: 6202d9c2066fd
      candidates:
        - display: text
          field: frontend
          type: struct
          visualWeight: 0
        - display: link
          field: frontend
          type: struct
          visualWeight: 1
        - display: tag
          field: backend
          type: struct
          visualWeight: 2
    - generationId: 6202dcb979eb5
      objectId: IDEA
      objectName: 想法
      propertyId: expectReleaseDate
      propertyName: 期望最迟交付的日期
      propertyInstanceId: 61df43df89879
      instanceId: 6202dcb979eb5
      candidates:
        - display: text
          formatter:
            format: relative
            type: date
          type: date
          visualWeight: -1
        - display: text
          formatter:
            format: accurate
            type: date
          type: date
          visualWeight: 0
        - display: text
          formatter:
            format: full
            type: date
          type: date
          visualWeight: 1
        - display: text
          formatter:
            format: full
            type: date
          type: date
          visualWeight: 2
    - generationId: 6202dcb97aeb9
      objectId: IDEA
      objectName: 想法
      propertyId: pdReviewTime
      propertyName: pd评审时间
      propertyInstanceId: 61df43df898dd
      instanceId: 6202dcb97aeb9
      candidates:
        - display: text
          formatter:
            format: relative
            type: date-time
          type: date-time
          visualWeight: -1
        - display: text
          formatter:
            format: accurate
            type: date-time
          type: date-time
          visualWeight: 0
        - display: text
          formatter:
            format: full
            type: date-time
          type: date-time
          visualWeight: 1
        - display: text
          formatter:
            format: full
            type: date-time
          type: date-time
          visualWeight: 2
    - generationId: 6202d9c221705
      objectId: IDEA
      objectName: 想法
      propertyId: status
      propertyName: 状态
      propertyInstanceId: 61df43df89941
      instanceId: 6202d9c221705
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: enum
          visualWeight: -1
        - display: tag
          style:
            palette:
              closed: gray
              pointEstimation: gray
              producerReview: gray
              ready: orange
              refused: red
              released: green
              techReview: gray
              waitAssess: gray
              waitInitialScore: gray
              waitIterate: gray
              waitPlan: gray
              waitProducerDesigned: gray
              waitRelease: gray
              waitTechDesigned: gray
            variant: default
          type: enum
          visualWeight: 0
        - display: tag
          style:
            palette:
              closed: gray
              pointEstimation: gray
              producerReview: gray
              ready: orange
              refused: red
              released: green
              techReview: gray
              waitAssess: gray
              waitInitialScore: gray
              waitIterate: gray
              waitPlan: gray
              waitProducerDesigned: gray
              waitRelease: gray
              waitTechDesigned: gray
            variant: outline
          type: enum
          visualWeight: 1
        - display: tag
          style:
            palette:
              closed: gray
              pointEstimation: gray
              producerReview: gray
              ready: orange
              refused: red
              released: green
              techReview: gray
              waitAssess: gray
              waitInitialScore: gray
              waitIterate: gray
              waitPlan: gray
              waitProducerDesigned: gray
              waitRelease: gray
              waitTechDesigned: gray
            variant: background
          type: enum
          visualWeight: 2
    - generationId: 6202d9c222385
      objectId: IDEA
      objectName: 想法
      propertyId: speedUp
      propertyName: 加速标志
      propertyInstanceId: 61df43df899a5
      instanceId: 6202d9c222385
      candidates:
        - countOnly: true
          display: text
          type: struct-list
          visualWeight: -1
        - countOnly: true
          display: link
          type: struct-list
          visualWeight: 0
        - display: tag
          field: reason
          maxItems: 2
          style:
            variant: default
          type: struct-list
          visualWeight: 1
        - display: tag
          field: mark
          maxItems: 2
          style:
            variant: outline
          type: struct-list
          visualWeight: 2
    - generationId: 6202d9c225909
      objectId: IDEA
      objectName: 想法
      propertyId: initialScore
      propertyName: PMO初评分
      propertyInstanceId: 61df43df89a09
      instanceId: 6202d9c225909
      candidates:
        - display: text
          formatter:
            decimals: 1
            format: decimal
            type: number
          style:
            color: var(--text-color-secondary)
            size: medium
          type: float
          visualWeight: -1
        - display: text
          formatter:
            decimals: 2
            format: decimal
            type: number
          style:
            color: var(--text-color-default)
            size: medium
          type: float
          visualWeight: 0
        - display: text
          formatter:
            decimals: 2
            format: decimal
            type: number
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: float
          visualWeight: 1
        - display: text
          formatter:
            decimals: 2
            format: decimal
            type: number
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: float
          visualWeight: 2
    - generationId: 6202dcb981ce1
      objectId: IDEA
      objectName: 想法
      propertyId: pmoReviewDate
      propertyName: PMO初评日期
      propertyInstanceId: 61df43df89a6d
      instanceId: 6202dcb981ce1
      candidates:
        - display: text
          formatter:
            format: relative
            type: date
          type: date
          visualWeight: -1
        - display: text
          formatter:
            format: accurate
            type: date
          type: date
          visualWeight: 0
        - display: text
          formatter:
            format: full
            type: date
          type: date
          visualWeight: 1
        - display: text
          formatter:
            format: full
            type: date
          type: date
          visualWeight: 2
    - generationId: 6202d9c227141
      objectId: IDEA
      objectName: 想法
      propertyId: ratingDetails
      propertyName: 评分详情
      propertyInstanceId: 61df43df89ad1
      instanceId: 6202d9c227141
      candidates:
        - countOnly: true
          display: text
          type: struct-list
          visualWeight: -1
        - countOnly: true
          display: link
          type: struct-list
          visualWeight: 0
        - display: tag
          field: type
          maxItems: 2
          style:
            variant: default
          type: struct-list
          visualWeight: 1
        - display: tag
          field: type
          maxItems: 2
          style:
            variant: outline
          type: struct-list
          visualWeight: 2
    - generationId: 6202d9c23969d
      objectId: IDEA
      objectName: 想法
      propertyId: enterpriseVersion
      propertyName: 发行版版本
      propertyInstanceId: 61df43df89b35
      instanceId: 6202d9c23969d
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202d9c24265d
      objectId: IDEA
      objectName: 想法
      propertyId: pdReviewComment
      propertyName: PD评审意见
      propertyInstanceId: 61df43df89b99
      instanceId: 6202d9c24265d
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202d9c240f51
      objectId: IDEA
      objectName: 想法
      propertyId: productLine
      propertyName: 产品线
      propertyInstanceId: 61df43df89bfd
      instanceId: 6202d9c240f51
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: medium
          type: string
          visualWeight: 1
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
    - generationId: 6202dcb97a365
      objectId: IDEA
      objectName: 想法
      propertyId: confirmDeliveryTime
      propertyName: 确认交付时间
      propertyInstanceId: 61df43df89c61
      instanceId: 6202dcb97a365
      candidates:
        - display: text
          formatter:
            format: relative
            type: date-time
          type: date-time
          visualWeight: -1
        - display: text
          formatter:
            format: accurate
            type: date-time
          type: date-time
          visualWeight: 0
        - display: text
          formatter:
            format: full
            type: date-time
          type: date-time
          visualWeight: 1
        - display: text
          formatter:
            format: full
            type: date-time
          type: date-time
          visualWeight: 2
    - generationId: 6202db84cacc9
      objectId: IDEA
      objectName: 想法
      propertyId: endDate
      propertyName: 完成时间
      propertyInstanceId: 61df43df89cc5
      instanceId: 6202db84cacc9
      candidates:
        - display: text
          formatter:
            format: relative
            type: date
          type: date
          visualWeight: -1
        - display: text
          formatter:
            format: accurate
            type: date
          type: date
          visualWeight: 0
        - display: text
          formatter:
            format: full
            type: date
          type: date
          visualWeight: 1
        - display: text
          formatter:
            format: full
            type: date
          type: date
          visualWeight: 2
  mocks:
    - category: performance
      classification: optimization
      closeReason: ""
      confirmDeliveryTime: "2024-08-25 14:30:00"
      confirmUrl: https://example.com/verify/001
      createRole: Product Manager
      customerConfirm:
        confirm: 1
        confirmTime: "2024-08-16 16:00:00"
        rejectReason: ""
      deliveryConfirm: false
      deliveryStatus: passed
      description: 提升用户界面的响应速度，减少加载时间。
      document:
        developUrl: https://example.com/develop/1234
        requirementUrl: https://example.com/requirement/5678
      endDate: "2024-10-20"
      enterpriseVersion: v2.1.0
      expectReleaseDate: "2024-10-15"
      finishTime: "2024-08-31 17:00:00"
      gradeInfo:
        grade: 4
        gradeTime: "2024-08-15 14:30:00"
        memo: 高质量交付，客户满意。
      humanCost:
        backend: 180.3
        frontend: 120.5
      initialScore: 75
      number: "001"
      op_plan_month: false
      pdReviewComment: 需要进一步评估市场反馈。
      pdReviewDate: "2024-08-18"
      pdReviewResult: true
      pdReviewTime: "2024-08-20 10:00:00"
      planStartDate: "2024-08-20"
      planStartTime: "2024-08-20 09:00:00"
      pmoReviewComment: 项目计划清晰，资源分配合理。
      pmoReviewDate: "2024-08-22"
      pmoReviewResult: true
      pmoReviewTime: "2024-08-17 10:00:00"
      predictDeliveryTime: "2024-09-01 18:00:00"
      productLine: Enterprise
      ratingDetails:
        - effort: 6
          frequency: 9
          reach: 7
          type: user
          urgent: 5
          value: 8
        - effort: 5
          frequency: 8
          reach: 6
          type: tech
          urgent: 4
          value: 7
      realStoryPoint: 12.5
      resolveTime: "2024-07-15 10:30:00"
      score: 8.5
      source: 微信端
      speedUp:
        - mark: true
          reason: 市场竞争力提升
          score: 1.5
        - mark: false
          reason: 内部需求调整
          score: 0
      stage: Development
      startDate: "2024-07-01"
      status: waitInitialScore
      value: High
    - category: functionalRequirements
      classification: feature
      closeReason: 需求范围不明确，需重新定义。
      confirmDeliveryTime: "2024-08-26 15:00:00"
      confirmUrl: https://example.com/verify/002
      createRole: Project Coordinator
      customerConfirm:
        confirm: 0
        confirmTime: ""
        rejectReason: 功能未完全满足需求。
      deliveryConfirm: true
      deliveryStatus: unconfirmed
      description: 增加新功能，允许用户自定义报告模板。
      document:
        developUrl: https://example.com/develop/4321
        requirementUrl: https://example.com/requirement/8765
      endDate: "2024-11-10"
      enterpriseVersion: v2.2.0
      expectReleaseDate: "2024-11-01"
      finishTime: "2024-09-14 15:00:00"
      gradeInfo:
        grade: 3
        gradeTime: "2024-08-10 10:00:00"
        memo: 交付质量一般，需改进。
      humanCost:
        backend: 150
        frontend: 90.2
      initialScore: 80
      number: "002"
      op_plan_month: true
      pdReviewComment: 优先级较高，需尽快安排资源。
      pdReviewDate: "2024-08-20"
      pdReviewResult: false
      pdReviewTime: "2024-08-21 11:00:00"
      planStartDate: "2024-08-25"
      planStartTime: "2024-08-25 09:30:00"
      pmoReviewComment: 项目计划需细化，资源分配需优化。
      pmoReviewDate: "2024-08-23"
      pmoReviewResult: false
      pmoReviewTime: "2024-08-16 11:00:00"
      predictDeliveryTime: "2024-09-15 16:00:00"
      productLine: Consumer
      ratingDetails:
        - effort: 5
          frequency: 10
          reach: 8
          type: user
          urgent: 6
          value: 9
        - effort: 4
          frequency: 9
          reach: 7
          type: tech
          urgent: 5
          value: 8
      realStoryPoint: 10.2
      resolveTime: "2024-08-20 14:45:00"
      score: 7.2
      source: 客户反馈
      speedUp:
        - mark: false
          reason: 无特殊加速需求
          score: 0
        - mark: true
          reason: 客户紧急需求
          score: 2
      stage: Planning
      startDate: "2024-08-01"
      status: waitAssess
      value: Medium
```
