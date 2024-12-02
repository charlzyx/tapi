---
outline: deep
---

# tApi 定义规范

## 简介

tApi 旨在使用受限制的 TypeScript 语法与约定文件结构, 来描述 Api 请求的完整形态;

### 数据类型的定义

使用 `class` 关键字来定义可复用实体类;

显然，相比于 `JSON Schema`, ts 的语法更加简洁易读， 语义明确, 类型的定义和复用轻而易举;

> 在 OpenAPI Spec 3.0 中， 用于类型定义的 [Schema Object](https://swagger.io/specification/v3/) 使用的使 JSON Schema Spec 的一个子集

特别的，充分利用 ts 的语法优势， 我们使用

- 内置 `int64/int32` 等内置的类型别名来简化基础类型变体
- 使用 JSDoc 来实现对 `JSON Schema` 属性的完整支持
- 使用 `?` 来表示是否 `required`
- 使用 `=` 赋值语句来表示默认值 `default`
- 使用 `联合字面量类型` 表示 `enum`, 它可以很容易的复用！

```ts
class Order {
  id: int64;
  petId: int64;
  /**
   * @title quantity of pets
   * @maximum 10
   * @minimum 0
   **/
  quantity: int32;
  status: Status;
  complete: boolean;
}

class Pet {
  /** @title 唯一标志 */
  id: int64 = 0;
  category: Category;
  name: string = "hi";
  photoUrls: string[];
  tags: Tag[];
  status: Status;
}

type Status = "placed" | "approved" | "delivered";
```

### 接口的定义

先举个 🌰

```ts
export type searchUserList = {
  method: "GET";
  url: "{{SERVER}}/searchby/:namelike";
  headers: {
    "x-token": Auth["token"];
  };
  cookies: {
    uid: string;
  };
  path: {
    namelike: User["name"];
  };
  query: PageQuery<{ name: string }>;
  body: {
    skip: number;
  };
  resp:
    | Resp<PageResp<User>>
    | Resp<PageResp<User>, "application/xml">
    | Reason<"namelike MUST NOT be empty">
    | Reason<"User not found", 404>;
};
```

:::details 类型详情

```ts
type PageQuery<T> = T & {
  pageNo: number;
  pageSize: number;
};

type PageResp<T> = {
  records: T[];
  total: number;
  pageNo?: number;
  pageSize?: number;
};

type Resp<
  T,
  ContentType extends BuiltInContentType = "application/json",
  HTTPStateCode = 200,
  Headers extends Partial<Record<BuiltInHttpHeaders, string>> = {}
> = {
  code: int32;
  data: T;
  message: string;
};

type Reason<
  T,
  HTTPStateCode = 400,
  Headers extends Partial<Record<BuiltInHttpHeaders, string>> = {}
> = {
  code: int32;
  reason: string;
};
```

:::

| 定义                 | 语法 \|属性名               | 例子                                   |
| -------------------- | --------------------------- | -------------------------------------- |
| 操作唯一标识         | `export type [OperationID]` | `export type getUser`                  |
| 请求方法             | `method`                    | `"GET"`                                |
| 请求地址             | `url`                       | `{{SERVER}}/getby/:id`                 |
| 请求头               | `headers`                   | `{ "x-token": string }`                |
| 请求 Cookies         | `cookies`                   | `{ "uid": string }`                    |
| 路径参数 PathParams  | `path`                      | `{ id: User['id']}`                    |
| 请求参数 QueryParams | `query`                     | `{ id: User['id']}`                    |
| 请求体 RequestBody   | `body`                      | `User`                                 |
| 响应值 Response      | `resp`                      | `Resp<User>\| Reason<"NotFound", 404>` |

如你所见 任何定义类型部分都可以使用

`字面量` -\> `字面量对象` 语法 \-> 类型引用 -\> 泛型表示

这样复杂的语法来充分发挥 ts 优异的表现力!

```ts
Resp<
  数据类型,
  ContentType = 'application/json',
  HttpStatusCode = 200,
  ResponseHeaders = {}
>

Reason<
  原因描述,
  HttpStatusCode = 200,
  ResponseHeaders = {}
>

```

## 最终转换输出标准 JSON 对象

TODO

### 附录

> OpenAPI 核心定义 伪类型 以 [v3.0](https://swagger.io/specification/v3/)为例

```ts
type Schema = {
  paths: PathsObject;
};
type PathsObject = {
  [`/{path}`]: PathItemObject;
};

type PathItemObejct = {
  get?: OperationObject;
  get?: OperationObject;
  // ...
};

type OperationObject = {
  parameters: ParameterObject | ReferenceObject;
  requestBody: RequestBody | ReferenceObject;
  responses: ResponseObject;
};
// ...
```
