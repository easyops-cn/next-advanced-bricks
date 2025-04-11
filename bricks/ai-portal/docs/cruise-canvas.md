构件 `ai-portal.cruise-canvas`

## Examples

### Basic

```yaml preview minHeight="600px"
brick: div
properties:
  style:
    width: 100vw
    height: 100vh
    position: fixed
    top: 0
    left: 0
children:
- brick: ai-portal.cruise-canvas
  properties:
    nodes:
      - id: "1"
        type: requirement
        content: |-
          帮我在CMDB中完成手机银行系统的资源纳管
      - id: "2"
        parent: "1"
        type: instruction
        executing: true
        content: |-
          深度搜素内部知识库，确认手机银行系统包含的逻辑组件和部署要求
      - id: "3"
        parent: "2"
        type: group
        groupChildren:
          - "4"
          - "5"
      - id: "4"
        parent: "2"
        type: online search
        title: 《手机银行系统》
        content: |-
          依据内部知识库，手机银行系统的逻辑组件包含用户认证，交易接入和理财中心三个模块组成。
      - id: "5"
        parent: "2"
        type: online search
        title: 《XX公司运维管理文件》
        content: |-
          依据《XX公司运维管理文件》该系统的重要等级为一级，可用性要求99.999%，MTTR为小于3分钟，该系统部署需要实现异地容灾，建议采用双中心部署，且单中心内核心模块无单点。
      - id: "7"
        parent: "3"
        type: tool
        content: |-
          依据内部知识库，手机银行系统的逻辑组件包含用户认证，交易接入和理财中心三个模块组成。依据《XX公司运维管理文件》该系统的重要等级为一级，可用性要求99.999%，MTTR为小于3分钟，该系统部署需要实现异地容灾，建议采用双中心部署，且单中心内核心模块无单点。
      - id: "8"
        parent: "7"
        type: instruction
        content: |-
          深度搜素CMDB给出资源的纳管现状
      - id: "9"
        parent: "8"
        type: summarize
        title: 总结
        content: |-
          基于CMDB查询手机银行的资源纳管情况，纳管现状总结如下：

          实例数据的完整性
          1. 系统录入（已完成）
          2. 模块录入（部分完成），交易接入模块未录入
          3. 环境录入（已完成）
          4. 主机录入（部分完成），交易接入模块主机未录入
          5. 部署实例录入（部分完成），交易接入模块的部署实例未录入

          关系数据的完整性
          1. 系统和模块（部分完成），系统和交易接入模块的关系未建立
          2. 系统和环境（√）
          3. 模块和主机（部分完成）
          4. ...
      - id: "10"
        parent: "9"
        type: instruction
        content: |-
          利用深度思考能力，给出手机银行系统的资源纳管优化方案，该方案用户可以微调或确认
      - id: "11"
        parent: "10"
        type: tool
        tag: ask user more
        content: |-
          - 交易接入模块的录入；
          - 系统和交易接入模块的关系创建 ；
          - 部署实例自动采集特征录入。
      - id: "12"
        parent: "11"
        type: instruction
        content: |-
          在CMDB中完成手机银行系统的资源纳管
      - id: "13"
        parent: "12"
        type: tool
        tag: ask user confirm
        content: |-
          方案执行的过程信息
      - id: "14"
        parent: "13"
        type: instruction
        content: |-
          生成纳管后手机银行系统的逻辑架构和部署架构图
      - id: "15"
        parent: "14"
        type: tool
        tag: topology
        content: |-
          https://example.com/topology
      - id: "16"
        parent: "15"
        type: summarize
        title: 综合分析
        finished: true
        content: |-
          该手机银行系统的资源纳管已经完成，本次纳管新增了交易接入模块和该模块相关的主机，以及部署实例信息，模块的纳管建议和架构管理平台打通，部署实例的纳管建议和自动发布平台打通，以便自动完成数据变更，确保数据的准确性，降低架构维护成本。

    _nodes:
      - id: "1"
        type: requirement
        content: |-
          给开源项目创建一个 logo 图标，SVG 格式，项目地址：https://github.com/easyops-cn/next-core

      - id: "2"
        parent: "1"
        type: instruction
        content: |-
          访问提供的 GitHub 链接 (https://github.com/easyops-cn/next-core) 并抓取项目 README 或描述信息，以了解 'next-core' 项目的目的和核心功能。

      - id: "3"
        parent: "2"
        type: group
        groupChildren:
          - "4"
          - "5"
          - "6"

      - id: "4"
        parent: "2"
        type: tool
        tag: online search
        title: next-core github
        content: |-
          `next-core` 在 GitHub 上有多个组织和仓库，每个都有不同的项目和活动。

          *   **nextcore** 是 GitHub 上的一个组织，拥有 8 个仓库<sup>[1]</sup>。 其中比较热门的仓库包括 radzen-blazor、MiniExcel、awesome-nocode-lowcode、meow-sql、MiniWord 和 hyperlambda<sup>[1]</sup>。

          *   **easyops-cn/next-core** 是一个名为 "Brick Next" 的低代码引擎库，它基于 Web Components<sup>[2]</sup>。 该仓库的活动包括依赖项更新和合并请求<sup>[2]</sup>。

          *   **Next Core** 是 GitHub 上的另一个组织，目前拥有 1 个仓库，名为 "nextcore"，是一个临时站点<sup>[3]</sup>。

          References:
          [1] next core nextcore - GitHub - https://github.com/nextcore
          [2] Activity · easyops-cn/next-core - GitHub - https://github.com/easyops-cn/next-core/activity
          [3] Next Core - GitHub - https://github.com/next-core

      - id: "5"
        parent: "2"
        type: tool
        tag: online search
        title: next-core easyops-cn
        content: |-
          以下是关于 easyops-cn/next-core 项目的综合信息：

          **项目概况**

          *   **Brick Next 是一个基于 Web Components 的低代码引擎库**，旨在构建高度插件化和可配置的企业用户界面解决方案¹。
          *   优维科技的 DevOps 平台 EasyOps 的前端完全基于 Brick Next 构建，实现了数百个企业级微应用的快速持续交付¹。

          **核心功能**

          *   **构件包 (Brick Package)**：定义可重用的构件，类似于组件，但具有更高的封装性，可以通过声明的方式使用，无需编程¹。构件可以是业务无关的 UI 组件，也可以是包含业务特性的大型组件¹。
          *   **微应用 (Micro App)**：由构件组装而成，其组装方式定义在 Storyboard 中，Storyboard 可以是 YAML 或 JSON 配置，也可以通过可视化工具编排¹。
          *   **Brick Next Core**：负责解析微应用的 Storyboard，并按照定义加载相应的构件¹。所有的构件包和微应用都可以独立部署，像插件一样工作¹。

          **技术细节**

          *   Brick Next Core 使用 GPL-3.0 协议¹。
          *   主要使用 TypeScript 编写 (78.8%)，也包含 JavaScript (13.6%)、CSS (4.2%)、Python (2.8%) 等¹。
          *   在 GitHub 上有 39 个 star 和 10 个 fork¹。

          **相关链接**

          *   **GitHub 仓库**：[easyops-cn/next-core](https://github.com/easyops-cn/next-core)¹
          *   **npm 包 (@next-core/easyops-analytics)**：[NPM](https://www.npmjs.com/package/@next-core/easyops-analytics) 这个包是 `easyops-analytics`，版本为 0.12.1，9 个月前发布。每周下载量为 38。

          **项目动态**

          *   项目正在积极维护中，有持续的代码提交和依赖更新²。

          **EasyOps DevOps平台**

          *   EasyOps 平台的前端完全基于 Brick Next 搭建¹。

          **EasyOps Analytics 包**

          *   `@next-core/easyops-analytics` 包由 `@next-core/brick-scripts v2.0.1` 生成³。

          **总结**

          Brick Next Core 是一个强大的低代码引擎，用于构建企业级应用，而 easyops-cn 团队正在积极开发和维护该项目。

          **References:**

          [1] easyops-cn/next-core - GitHub - [https://github.com/easyops-cn/next-core](https://github.com/easyops-cn/next-core)
          [2] Activity · easyops-cn/next-core - GitHub - [https://github.com/easyops-cn/next-core/activity](https://github.com/easyops-cn/next-core/activity)
          [3] @next-core/easyops-analytics - npm - [https://www.npmjs.com/package/@next-core/easyops-analytics](https://www.npmjs.com/package/@next-core/easyops-analytics)

      - id: "6"
        parent: "2"
        type: tool
        tag: online search
        title: easyops-cn next-core features
        content: |-
          基于搜索结果，easyops-cn 的 next-core 具有以下特点：

          *   **Brick Next 是一个基于 Web Components 的低代码引擎库**，用于构建高度插件化和高度可配置的企业用户界面解决方案¹。
          *   **Brick Next Core 负责解析微应用的 storyboards，并按照定义装载相应的构件**¹。
          *   **构件可以很容易地通过声明的方式消费，无需编程**¹。
          *   **所有的构件包和微应用都可以独立部署，像插件一样工作**¹。

          References:
          [1] easyops-cn/next-core: Brick Next is a low-code engine ... - GitHub - https://github.com/easyops-cn/next-core

      - id: "7"
        parent: "3"
        type: summarize
        title: Summarization
        content: |-
          好的，我们来分析 `easyops-cn/next-core` (Brick Next) 项目的关键特性和设计理念，并提炼出适合 Logo 设计的核心元素或概念。

          **项目核心特性与设计理念分析**

          1.  **模块化与组装 (Modularity & Assembly):**
              *   **特性:** 以“构件包 (Brick Package)”和“微应用 (Micro App)”为核心，强调可复用、高内聚的模块。通过 Storyboard (YAML/JSON/可视化) 来定义和组装这些模块。
              *   **理念:** 像搭积木一样构建复杂系统，提高复用性、降低耦合度。

          2.  **低代码/声明式 (Low-Code / Declarative):**
              *   **特性:** 构件可以通过声明方式使用，无需（或极少需要）编程。Storyboard 本身也是一种声明式的配置。
              *   **理念:** 简化开发过程，降低技术门槛，提高开发效率，让开发者更专注于业务逻辑而非底层实现。

          3.  **核心引擎 (Core Engine):**
              *   **特性:** `Brick Next Core` 负责解析 Storyboard 并加载构件，是整个系统的“大脑”和运行基础。
              *   **理念:** 提供一个稳定、强大的基础平台，支撑上层应用的灵活构建和运行。

          4.  **插件化与独立性 (Pluginization & Independence):**
              *   **特性:** 构件包和微应用都可以独立部署，像插件一样工作。
              *   **理念:** 提供高度的灵活性和可扩展性，便于维护和升级。

          5.  **连接与编排 (Connection & Orchestration):**
              *   **特性:** 核心引擎连接并根据 Storyboard 编排不同的构件，使之协同工作形成完整的应用。
              *   **理念:** 关注点分离，核心负责调度，构件负责功能，通过配置将它们有效连接。

          6.  **面向企业级UI (Enterprise UI Focus):**
              *   **特性:** 目标是构建高度插件化和可配置的 *企业用户界面* 解决方案，已成功应用于 EasyOps DevOps 平台。
              *   **理念:** 满足企业级应用对复杂度、可配置性、稳定性和效率的要求。

          7.  **下一代/未来感 (Next Generation / Future-Oriented):**
              *   **特性:** 项目名称含 "Next"，采用 Web Components 等现代技术。
              *   **理念:** 代表着一种更先进、更高效的应用构建方式。

          **提炼出的 Logo 设计核心元素/概念**

          基于以上分析，以下核心元素或概念非常适合用于 `easyops-cn/next-core` 的 Logo 设计：

          1.  **核心 (Core):**
              *   **来源:** 项目名称 `next-core`，核心引擎 `Brick Next Core` 的定位。
              *   **象征:** 中心、基础、引擎、驱动力。
              *   **视觉联想:** 圆心、内核、坚实的基础结构、汇聚点。

          2.  **积木/构件 (Bricks / Components):**
              *   **来源:** 项目别名 "Brick Next"，核心概念“构件包 (Brick Package)”。
              *   **象征:** 模块化、组装、构建、可复用性。
              *   **视觉联想:** 方块、模块、拼图、相互连接或堆叠的几何形状。

          3.  **连接/链接 (Connection / Link):**
              *   **来源:** 构件与微应用的组装关系，插件化特性，核心引擎的连接作用。
              *   **象征:** 整合、协同、插件化、网络、关系。
              *   **视觉联想:** 链条、节点与连线、交织的线条、接口、插头/插座。

          4.  **蓝图/编排 (Blueprint / Orchestration):**
              *   **来源:** Storyboard 的概念，通过配置定义应用结构。
              *   **象征:** 规划、设计、声明式、结构、自动化。
              *   **视觉联想:** 网格线、示意图、流程线、抽象的结构图。

          5.  **下一代/箭头 (Next / Arrow):**
              *   **来源:** 项目名称中的 "Next"。
              *   **象征:** 进步、未来、方向、效率、演进。
              *   **视觉联想:** 指向前方或上方的箭头、流线型设计、动态感。

          **综合建议**

          一个好的 Logo 可能会巧妙地融合以上多个元素。例如：

          *   **核心 + 积木:** 一个中心元素，周围环绕或连接着模块化的“积木”形状。
          *   **积木 + 连接:** 几个“积木”形状通过明确的“连接”元素（线条、接口）组合在一起。
          *   **核心 + 箭头:** 一个代表核心的形状与代表“下一代”的箭头结合，形成动态感。
          *   **积木 + 蓝图:** 在网格或示意图背景上放置“积木”元素，体现声明式构建。

          选择哪个或哪几个元素进行组合，取决于希望传递的首要信息和期望的视觉风格（例如，是更强调其“核心引擎”的稳固性，还是“积木构建”的灵活性，或是“下一代”的前瞻性）。

      # - id: "8"
      #   parent: "7"
      #   type: tool
      #   tag: search images
      #   resources:
      #     - type: image
      #       title: 四季複製畫- 莫內Claude Monet 世界名畫複製畫專業品質
      #       url: |-
      #         https://fine-art-print.tw/P/Claude-Monet/s/Antibes,%20Afternoon%20Effect,%201888.jpg?v=4
      #       height: 280
      #       width: 350
      #     - type: image
      #       title: 艺谭|莫奈的海印象的海_手机搜狐网
      #       url: |-
      #         http://5b0988e595225.cdn.sohucs.com/images/20191021/a5c37b43eb324ce09d582da971c7cfd5.jpeg
      #       height: 531
      #       width: 640
      #     - type: image
      #       title: 四季複製畫- 莫內Claude Monet 世界名畫複製畫專業品質
      #       url: |-
      #         https://fine-art-print.tw/P/Claude-Monet/s/Low%20Tide%20at%20Pourville%2002,%201882.jpg?v=4
      #       height: 259
      #       width: 350

      - id: "8"
        parent: "7"
        type: tool
        tag: ask user more
        content: |-
          请详细说下。

      - id: "9"
        parent: "8"
        type: tool
        tag: generate image
        finished: true
        content: |-
          https://photo.16pic.com/00/07/99/16pic_799976_b.jpg

# - brick: div
#   properties:
#     style:
#       position: absolute
#       bottom: 0
#       left: 0
#       right: 0
#       display: flex
#       justifyContent: center
#       padding: 24px
#   children:
#   - brick: ai-portal.chat-box
#     properties:
#       style:
#         width: 100%
#         maxWidth: 600px
#     events:
#       message.submit:
#         action: message.info
#         args:
#           - '<% `Message: ${EVENT.detail}` %>'
```
