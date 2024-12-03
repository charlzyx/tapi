---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "tApi"
  text: "基于 TypeScript 的轻量级 API 设计/描述工具."
  tagline: Work in Progressing
  image:
    src: ./bg.svg
    alt: Banner
  actions:
    - theme: brand
      text: tApi 规范
      link: /rfc

features:
  - title: TypeScript 语法定义 API
    details: 使用 TypeScript 的语法描述 API，不仅语法简洁、语义明确，还具备强大的类型表达能力，让 API 描述更易读、更易维护。
  - title: .ts 纯文本存储
    details: API 描述以 `.ts` 文件的形式存储，支持完全离线的工作模式，方便集成到 Git 仓库中进行版本管理。
  - title: 语言无关性
    details: 虽然基于 TypeScript 描述，但生成的接口可以应用于任何编程语言的客户端或服务器。
  - title: 灵活扩展性
    details: 支持生成文档、代码、测试用例等多种用途，满足现代开发流程中的多样化需求。
---
