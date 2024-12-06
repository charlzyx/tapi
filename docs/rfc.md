---
outline: deep
---

# tApi 规范 v1.0.0

## 概述

tApi 是一个优雅的 API 类型描述规范，借助 TypeScript 强大的类型系统，让 API 定义更自然、更具表现力。完全兼容 OpenAPI 3.0 规范，让您在享受类型系统优势的同时，还能无缝对接现有工具生态。

## 数据类型定义

> 在 OAS 中，这部分内容对应 Schema Objects，用于描述数据结构。

### 基础类型

除了直接映射关系的 `string` `boolean` 等 ts 基础类型之外, 还内置了几个类型别名方便对其 OAS 规范

::: details 内置别名

```typescript
type int32 = number; // { type: "integer", format: "int32" }
type int64 = number; // { type: "integer", format: "int64" }
type float = number; // { type: "number", format: "float" }
type double = number; // { type: "number", format: "double" }
type binary = string; // { type: "string", format: "binary" }
type date = string; // { type: "string", format: "date" }
type datetime = string; // { type: "string", format: "date-time" }
```

:::

### 数据模型

使用 `class` 关键字定义数据模型, 并利用语法优势实现一下特性

- 使用联合字面量类型定义枚举值：
- 可选字段：使用 `?` 标记
- 默认值：使用 `=` 赋值
- 数组类型：使用 `[]` 后缀

```typescript
type Status = "placed" | "approved" | "delivered";
class Pet {
  id: int64 = 0;
  name: string;
  status: Status;
  tags?: Tag[];
}
```

## API 操作定义

> 在 OAS 中，API 操作通过 Path Item Object 和 Operation Object 的组合来描述。tApi 采用更直观的方式，用单个类型定义来表达完整的 API 操作。

任何包含 `url` 字段的类型字面量 `type alias` 定义都会被识别为 API 操作：

```typescript
type createPet = {
  method: "POST";
  url: "{{SERVER}}/pet";
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  path?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
  resp: Resp<Pet> | Reason<string>;
};
```

### 参数定义

> 以下代码集中展示了不同的参数类型如何编排

使用 `body` 字段定义请求体，支持复用数据模型：

```typescript
type getPet = {
  url: "/pets/:id";
  //  请求头 (Headers)
  headers: {
    "api-key": string;
  };
  // 路径参数 (Path Parameters)
  path: {
    id: Pet["id"]; // 可以引用数据模型中的类型
  };
  // 查询参数 (Query Parameters)
  query: {
    status?: Status; // 可以使用可选参数
    limit?: number;
  };
  // 请求体 (Request Body)
  body: Partial<Pet>; // 可以使用 TypeScript 的工具类型
};
```

### 响应定义 (Responses)

使用泛型类型定义标准响应格式：

```typescript
// 成功响应
type Resp<
  T,
  ContentType = "application/json",
  HTTPStateCode = 200,
  Headers = {}
> = {
  code: int32;
  data: T;
  message: string;
};

// 错误响应
type Reason<T, HTTPStateCode = 400, Headers = {}> = {
  code: int32;
  reason: T;
};

// 在 API 操作中使用
type getPet = {
  resp:
    | Resp<Pet> // 成功响应
    | Resp<Pet, "application/xml"> // 不同格式
    | Reason<"Pet not found", 404>; // 错误响应
};
```

## 类型系统扩展

tApi 充分利用 TypeScript 的类型系统来提供更强大的类型复用能力：

### 泛型支持

```typescript
type PageQuery<T> = T & {
  pageNo: number;
  pageSize: number;
};
```

### 类型组合

```typescript
type AdminUser = User & {
  permissions: string[];
};
```

### 工具类型

```typescript
type CreateDTO<T> = Omit<T, "id">;
type UpdateDTO<T> = Partial<T>;
```

## 开发者体验

由于采用 TypeScript 语法，tApi 定义可以获得：

1. IDE 智能提示和类型检查
2. 代码跳转和重构
3. 注释和文档生成
4. TypeScript 生态系统工具支持

tApi 可以完全转换为 OpenAPI 3.0 规范：

1. 数据模型转换为 Schema Objects
2. API 操作转换为 Operation Objects
3. 类型定义转换为 Components
4. 保留所有元数据注解

这意味着您可以：

1. 使用现有的 OAS 工具链
2. 生成标准的 API 文档
3. 使用现有的代码生成器
4. 与其他 API 工具集成

## 与 OpenAPI 的对比

1. 语法更自然：使用 TypeScript 类型系统替代 JSON Schema
2. 更好的类型安全：编译时类型检查
3. 更强的可维护性：支持代码重构和跳转
4. 更好的开发体验：IDE 支持和类型提示
5. 更灵活的类型复用：支持完整的 TypeScript 类型系统

## 示例工程

示例文件与输出

- [charlzyx/tapi/example](https://github.com/charlzyx/tapi/tree/master/example)
