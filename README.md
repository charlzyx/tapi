# What's tApi? 项目简介

> **!! Work in Progress**

**tApi** 是一款基于 TypeScript 的下一代 API 设计与描述工具链，旨在通过 TypeScript 类型系统的强大表现力，取代 OpenAPI 冗长复杂的语法，提供更高效、更直观的 API 设计体验。

---

## 核心特性 / Features

- **TypeScript 语法定义 API**  
  使用 TypeScript 的语法描述 API，不仅语法简洁、语义明确，还具备强大的类型表达能力，让 API 描述更易读、更易维护。

- **`.ts` 纯文本存储**  
  API 描述以 `.ts` 文件的形式存储，支持完全离线的工作模式，方便集成到 Git 仓库中进行版本管理。

- **语言无关性**  
  虽然基于 TypeScript 描述，但生成的接口可以应用于任何编程语言的客户端或服务器。

- **灵活扩展性**  
  支持生成文档、代码、测试用例等多种用途，满足现代开发流程中的多样化需求。

---

## 功能规划 / Roadmap

- [ ] **`importer`**  
       提供从 Postman、Swagger 和 OpenAPI 格式转换到 tApi 的功能，方便与现有工具集成。

- [ ] **`codegen`**  
       支持自定义代码生成插件，生成不同语言和客户端请求层代码。

- [ ] **`runner`**  
       支持 Mock 数据和 Test 脚本的运行，帮助开发者快速验证 API 的功能与行为。

- [ ] **`devtools`**  
       开发 VSCode 插件和 GUI 客户端，进一步优化 API 描述的编辑和可视化体验。

---

## 灵感来源

tApi 的灵感来源于 [Bruno](https://docs.usebruno.com/introduction/what-is-bruno)。与 Bruno 自定义 DSL 不同，tApi 直接使用 TypeScript 语法描述 API，同时补全了 Bruno 在 Response 类型定义上的不足，提供更完整的 API 设计能力。

通过 tApi，您可以将 API 描述与开发无缝衔接，让 API 设计更加高效、直观，同时降低学习成本，提升团队协作效率。

---

_润色 by ChatGPT_
