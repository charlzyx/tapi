---
outline: deep
---

# tApi 定义规范

## 简介

tApi 旨在使用受限制的 TypeScript 语法, 来描述 Api 请求的数据结构;

## 数据类型的定义

在 `d.ts` 文件中使用 `class` 关键字来定义可复用实体类;

显然，相比于 `JSON Schema`, ts 的语法更加简洁易读， 语义明确, 类型的定义和复用轻而易举;

> 在 OpenAPI Spec 3.0 中， 用于类型定义的 [Schema Object](https://swagger.io/specification/v3/) 使用的使 JSON Schema Spec 的一个子集

特别的，充分利用 ts 的语法优势， 我们使用

- 使用 `int64`、`int32` 等内置类型别名，简化基础类型变体；
- 借助 JSDoc 支持 `JSON Schema` 属性的完整定义；
- 用 `?` 表示字段是否为 `required`；
- 用 `=` 赋值语句定义默认值 (`default`)；
- 用联合字面量类型 (`union literal types`) 表示 `enum`，从而轻松实现复用。

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

## 接口操作的定义

在 `ts` 文件中, 使用 type 来定义接口类型; 当 `type operation = { url: 'URL' }` 满足这样的形式, 就认为是一个接口操作定义

先举个 🌰， 在这个例子中， 我们会用到以下语法来表示一个请求操作

- 字面量 (Literal)
- 字面量对象 (Object Literal)
- 类型引用 (Type Reference)
- 泛型表示法 (Generic)

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

:::details 泛型定义

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
  数据类型,
  ContentType extends BuiltInContentType = "application/json",
  HTTPStateCode = 200,
  Headers extends Partial<Record<BuiltInHttpHeaders, string>> = {}
> = {
  code: int32;
  data: 数据类型;
  message: string;
};

type Reason<
  原因描述,
  HTTPStateCode = 400,
  Headers extends Partial<Record<BuiltInHttpHeaders, string>> = {}
> = {
  code: int32;
  reason: string;
};
```

:::

| 定义                        | 属名                    | 说明                                                        |
| --------------------------- | ----------------------- | ----------------------------------------------------------- |
| `export type [OperationID]` | -唯一标识 / OperationID | 请保证全局唯一                                              |
| method                      | -请求方法 / Method      | `GET\|POST\|PUT\|OPTION\|HEAD\|TRACE`                       |
| url                         | -请求地址 / Url         | 支持 `{{变量}}` 与`/getby/:id` 路径参数表示法               |
| headers                     | -请求头 / Headers       | 根据 HTTP 标准，`Key` 值大小写不敏感                        |
| cookies                     | -请求 / Cookies         | 根据标准 TODO                                               |
| path                        | -路径参数 / PathParams  | 路径参数，只有字符串类型，这是一个补充， 更多是为了表明语义 |
| query                       | -请求参数 / QueryParams | 类型限制参考 qs                                             |
| body                        | -请求体 / RequestBody   | 比较自由， 二进制 TODO                                      |
| resp                        | -响应值 / Response      | 支持多中类型联合类型                                        |

## 最终转换输出标准 JSON 对象

TODO：具体转换细节待补充。

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
