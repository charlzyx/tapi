---
outline: deep
---

# tApi 定义规范

## 简介

tApi 旨在使用受限制的 TypeScript 语法与约定文件结构, 来描述 Api 请求的完整形态;

## 举个例子

文件结构 PetSotre

```sh
├── Pet
│   ├── createPet.ts
│   ├── deletePet.ts
│   ├── findPetById.ts
│   ├── findPetByStatus.ts
│   ├── findPetByTags.ts
│   ├── updatePet.ts
│   ├── updatePetWithForm.ts
│   └── uploadPetImage.ts
├── Store
│   ├── deleteOrder.ts
│   ├── getInventory.ts
│   ├── getOrderById.ts
│   └── placeOrder.ts
├── User
│   ├── createUser.ts
│   ├── createUserWithList.ts
│   ├── deleteUser.ts
│   ├── getUserByName.ts
│   ├── login.ts
│   ├── logout.ts
│   └── updateUser.ts
├── builtins.d.ts
├── defs.d.ts
└── meta.d.ts
```

`/User/getUserByName.ts`

```ts
export type get = {
  url: "{{SERVER}}/user/:username";
  path: {
    username: User["username"];
  };
  resp:
    | Resp<User>
    | Resp<User, "application/xml">
    | Reason<"INvalid username supplied">
    | Reason<"User not found", 404>;
};
```

### `builtins.d.ts` 内置的类型

提供了一些基础的类型转换和常用的辅助类型; 下列类型转换用于简化 类似 OpenApi 所支持的原始类型;
通常情况下, 这里作为基础支持, 不需要改动

```ts
type int32 = number;
type int64 = number;
type float = number;
type double = number;
type date = string;
type datetime = string;
type password = string;
type binary = string;
type byte = string;
```

辅助类型不是必须的, 存在目的更多是为了简化编写

### `meta.d.ts` 自定义辅助类型

在这里, 你可以定义自己的包含泛型的 `请求/响应` 通用类型定义, 并不限制类型多少, `APT` 将会尽可能的满足你的自定义推断

### `defs.d.ts` 实体类定义

在这里, 你可以使用 `class` 关键字来定义实体内容, `enum`类型暂时提供 Union Type 支持;

类型的互相引用则可以使用 `TypeScript` 类型定义支持;

因为是 `d.ts` 文件, 所以基础类型会作为全局导入

1. 属性注释: 支持 jsDoc `/** @title 就像这样 */` 当然, 多行也是支持的

```ts
/**
 * @title nameof property
 * @tableName tabel_name
 */
```

单行的 `// 注释` 也是可以的, 包含

```ts
{
  // 上一行的注释
  name: string; // 和末尾的注释
}
```

?? 突发 TODO: @tableName("装饰器用起来怎么样")

显然, 这里还没有明确的规范

2. 枚举的支持: 暂时对 `Union String` 做一下支持, `enum` 的支持在考虑中, 主要是, `openapi` 规范与 `ts` 的 `enum` 表现需要增加限制来保持一致性

```ts
// 参考: https://editor-next.swagger.io/
type Status = "placed" | "approved" | "delivered";

class Order {
  id: int64;
  petId: int64;
  quantity: int32;
  shipDate: datetime;
  status: Status;
  complete: boolean;
}

class Pet {
  /** Pet's id */
  id: int64 = 0;
  // getJsDocs() cannot see me
  category: Category; // but getLeadingCommentRanges/getTrailingCommentRanges can do it!
  // name with default
  name: string = "hi";
  /** photos */
  photoUrls: string[];
  tags: Tag[];
  status: Status;
}
```

### 接口的定义

1. 请求方法: `export type [请求方法]` 根据 type 的别名(alias) 表示请求方法
   > delete 因为是关键字, 使用 del 代替
2. 请求路径: `url`字段指定请求路径, 路径中的参数使用 `:pathParms` 来表述
   > 查询参数 `?a=1` 不在这里表示
3. 请求参数/路径参数`path`: 这是一个冗余的信息, 用来语义化的表名参数的含义;
4. 请求参数/查询参数`query`: 查询参数类型
   > 根据 http 协议约定, 这里只支持简单值类型和简单值类型所组成的数组
5. 请求参数/请求头`headers`: 请求头的定义
   > 这里只支持简单值类型和简单值类型所组成的数组
6. 请求参数/请求`Cookie`: 请求 Cookie 内容
   > 这里只支持简单值类型和简单值类型所组成的数组
7. 响应值类型`resp`: 这里就开始复杂起来了, 通常情况下, 我们将要用到 `Resp` 和 `Reason` 包装器来表示不同的响应值了;

在当前例子中, 正常响应的数据类型与默认值含义如下: `Resp<数据类型, ContentType = 'application/json', HttpStatusCode = 200, ResponseHeaders = {}>`,

错误处理的类型含义与默认值: `Reason<原因描述, HttpStatusCode = 200, ResponseHeaders = {}>`

```ts
export type get = {
  url: "{{SERVER}}/user/:pathParam";
  path: {
    pathParams: User["id"];
  };
  query: {
    name?: User["name"];
    tags?: string[];
  };
  headers: {
    "X-Token": string;
  };
  cookie: {
    username: string;
  };
  resp:
    | Resp<User>
    | Resp<User, "application/xml">
    | Reason<"INvalid username supplied">
    | Reason<"User not found", 404>;
};
```

## 最终转换输出标准 json 定义
