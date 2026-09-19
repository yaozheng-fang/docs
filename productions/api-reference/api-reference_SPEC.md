# API Reference 文档规范

本规范适用于 `productions/api-reference/` 下的 API 参考。根目录 `SPEC.md` 是上位规范；本文件补充接口分类、OpenAPI 和页面组织要求。

## 内容范围

API 参考分为两个独立分组：

- **Agent API Server 接口**：应用、会话、智能体运行、制品、记忆、评测和调试等公开 HTTP 接口
- **Harness Runtime 接口**：Harness 调用、请求级配置、会话以及启用后的定时任务等公开 HTTP 接口

两类服务可以提供相同路径，但请求模型、默认行为和部署条件可能不同，必须分别核实。Harness 兼容的通用接口可引用 Agent API Server 说明，引用前确认其公开行为一致。CLI 命令、云平台资源管理接口和内部管理能力不属于本参考。

当前内容只更新 Preview，不从归档推断现有接口。中英文路径、层级、方法、字段、默认值、状态码和示例必须等价。

## 目录与导航

```text
productions/api-reference/
├── openapi/
│   ├── zh/
│   │   ├── agent-api-server.json
│   │   └── harness-runtime.json
│   └── en/
│       ├── agent-api-server.json
│       └── harness-runtime.json
└── preview/
    ├── zh/
    │   ├── index.mdx
    │   ├── agent-api-server/
    │   └── harness-runtime/
    └── en/
        ├── index.mdx
        ├── agent-api-server/
        └── harness-runtime/
```

每类服务保留一个 `overview.mdx`，说明用途、启动方式、服务地址、认证条件和兼容范围。每个 HTTP 操作使用独立页面，必要时按资源分组。导航在 `docs.json` 的 API 参考产品中配置为「Agent API Server 接口」和「Harness Runtime 接口」，英文采用对应名称。

调整原有页面时保留有效入口或提供重定向，不能使已有链接失效。不要因两个服务有同名路径而共享单接口页面。

## OpenAPI 与原生接口样式

接口采用 Mintlify 原生 HTTP API 样式，方法标签、路径、参数、响应结构和请求示例均由 OpenAPI 定义提供。单接口页面的 frontmatter 格式为：

```yaml
---
title: "接口名称"
openapi: "/productions/api-reference/openapi/zh/agent-api-server.json GET /actual/path"
---
```

必须显式写出规范文件、方法和路径，以免多个规范中的同名路径匹配错误。英文页面绑定英文规范。概览页提供 `title`，不添加页面副标题；所有页面保留并维护语言切换使用的 `en_link` / `zh_link`。

两种语言分别维护规范中的 `summary`、`description`、标签和示例说明，字段名、方法、路径、模型及约束保持一致。所有 `$ref` 在同一规范内可解析，不使用外部文件引用。

规范至少包含以下内容：

- 每个操作的方法、路径、唯一 `operationId` 与用途
- Path、Query、Header 和 Body 参数的类型、必填项、默认值、枚举及限制
- 公开请求与响应模型，包含数组元素、嵌套字段和可空字段
- 已核实的状态码、响应媒体类型与必要示例
- 服务地址以及真实适用的认证方式

开放映射可使用 `additionalProperties`；不能为省略已知字段而以空对象替代复杂请求或响应。不要根据字段名猜测默认值，也不要把动态插件数据误写成固定字段。

## 调用与调试

各服务的 `servers` 独立配置，不假设它们部署在相同地址。默认示例使用本地地址或明确的占位符；云端认证要求应在正文说明，不能给无认证的本地路由虚构强制鉴权。

使用 Mintlify 的 cURL、Python 和 JavaScript 示例。流式接口明确声明 `text/event-stream`，提供实际事件格式与 cURL `-N` 示例；必要时通过 `x-codeSamples` 补充客户端流式读取方式。不能把事件流描述为一次性 JSON 响应，也不能承诺未经确认的逐事件在线调试能力。

删除、写入、执行智能体或运行评测等操作应说明影响。文档校验不实际调用用户的线上接口，不包含真实凭证、账号、内部域名或用户数据。

## 事实来源与校验

以目标版本的实际公开路由、OpenAPI、请求响应模型和可执行测试为事实依据。CLI 部署的 Harness 必须同时核对对应 CLI tag 随包提供的服务、SDK 和依赖版本，不得用 VeADK 的另一套服务代替。区分服务鉴权、共享 OAuth 和可选定时任务等部署方式的接口范围。优先导出实际服务的规范；存在重复路由或动态注册时，按真实请求匹配顺序核对，不能仅信任被覆盖的 OpenAPI 操作。

概览页说明兼容版本与服务启动条件。只有 Preview 源码可用的接口要明确可用范围、核验基线和公开源码安装方式，不得暗示稳定安装包已包含该能力。

发布前核对：

- 旧接口覆盖与两类服务的归属，没有遗漏公开操作或混入内部路由
- 所有页面的绑定与规范中的方法、路径一致
- 两种语言的结构、字段、示例、状态码与限制等价
- 导航、旧入口和正文链接有效
- 本地页面正常展示方法、参数、响应和代码示例
- OpenAPI 引用可解析，站点配置与差异格式有效

不记录源码内部路径、路由注册机制或私有实现。页面正文用于说明调用条件、约束和示例，不重复维护另一套参数表。
