# Documentation project instructions

## About this project

- This is a documentation site built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Use the Mintlify MCP server, `https://mcp.mintlify.com`, to edit content and settings via MCP
- Use the Mintlify docs MCP server, `https://www.mintlify.com/docs/mcp`, to query information about using Mintlify via MCP

> 完整的写作规范见仓库根目录的 [`SPEC.md`](./SPEC.md)。本节是供 AI 工具自动加载的精简版；两者冲突时以 `SPEC.md` 为准。

## Terminology

- 正文中的 “agent” 一律译为「智能体」；代码标识符、类名（`Agent`）与配置键（`model.agent`）保持原样。
- 中文不要给术语附加括号内的译名/注解，标题同样：写「火山方舟」「Cozeloop」`title: "A2UI"`，而非「火山方舟（Ark）」`title: "A2UI（智能体驱动 UI）"`。无对应中文的技术标识（extras、RAG、Redis、API Key）保留英文。
- 后端类文章标题用「使用 xxx 存储」，不附括号英文。

## Style preferences

- 采用书面、正式的中文，避免口语化。
- 不要把提问或提示词原封不动搬进文档，一律以文档自身口吻重写。
- 标题使用描述性短语，不用数字序号（不写 `## 1. 安装`）。
- YAML frontmatter 只提供 `title`，不添加 `description` 或页面副标题。
- 内容具体、完整：提到可选安装/配置时写清它包含什么；介绍可扩展点必须给出使用方法与示例。
- 每个后端有独立、完整的说明（全部参数：名称、类型、默认值、说明 + 可运行示例）。命令行的所有子命令与标志用表格列出并配示例。
- 避免源码级表述：不暴露内部文件名、内部函数名、私有机制、异常类型或构造参数字面量；以使用者视角描述行为。用户需直接使用的公开 API（类名、构造参数、配置键、环境变量、用户自建文件路径）应保留并写清。
- 默认不添加「下一步」一类的收尾章节，除非明确要求。
- 双语站点：中文默认，英文并列；两侧目录结构与页面层级保持一致，改动同步更新。

## Content boundaries

- 文档面向使用者，不记录内部实现细节、源码走读或内部管理功能。
