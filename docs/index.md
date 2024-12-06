---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "tApi"
  text: "优雅的 API 类型描述规范"
  tagline: 用 TypeScript 的力量，让 API 定义更自然
  image:
    src: ./bg.svg
    alt: Banner
  actions:
    - theme: brand
      text: tApi 规范
      link: /rfc

features:
  - title: TypeScript 语法定义 API
    details: 用 class 定义数据模型，用 type 定义 API 操作。利用 TypeScript 类型系统提供完整的类型检查和推导能力。
  - title: 优雅的元数据注解
    details: 支持 JSDoc、装饰器和行内注释三种方式添加元数据。可选字段、默认值等特性让 API 定义更加灵活。
  - title: 站在巨人的肩膀上
    details: 完全兼容 OpenAPI 3.0 规范，可以复用现有的工具生态。无需重新发明轮子，专注于提供更好的开发体验。
  - title: 开发者友好
    details: 享受 IDE 的智能提示、类型检查和代码重构能力。纯文本的 .ts 文件让版本控制和团队协作更加自然。

---


<div style="margin: auto; padding: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 80px) 64px 64px; overflow: scroll; ">


## 快速预览

```ts
// 定义数据模型
class Pet {
  /** Pet's id */
  id: int64 = 0;
  name: string;
  status: "available" | "pending" | "sold";
}

// 定义 API 操作
type createPet = {
  method: "POST";
  url: "{{SERVER}}/pet";
  body: Pet;
  resp: Resp<Pet> | Reason<"Invalid input">;
};
```

</div>