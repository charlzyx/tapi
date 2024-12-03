# Waht's tApi ? 项目简介

> !! Work in Progress

tApi 是一款基于 TypeScript 的下一代 API 设计/描述工具链.

旨在使用 Typescript 类型的表现力替代 OpenAPI 冗长的语法;

## 核心特性 / Features

- TypeScript 语法定义 API

> 语法简洁, 语义明确, 表现力强大

- `.ts` 纯文本存储

> 完全离线工作模式, 方便集成到 Git 中管理

### 功能规划 / Roadmap

- [] `importer` 支持转换 Postman、Swagger 和 OpenAPI 格式，方便与现有工具集成。
- [] `codegen` 支持代码生成插件定制能力
- [] `runner` 支持 Mock 与 Test 脚本
- [] `devtools` 开发 VSCode 插件/GUI 客户端

### 灵感来自 [bruno](https://docs.usebruno.com/introduction/what-is-bruno)

但不同于 bruno 的自定义 DSL, 我们直接使用 Ts 语法完成 Api 描述, 并补全 bruno 缺失的 Response 类型定义
