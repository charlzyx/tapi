---
outline: deep
---

# tApi 规范 v1.0.0

## 概述

tApi 是一个优雅的 API 类型描述规范，用 TypeScript 的力量让 API 定义更自然。不同于 OpenAPI Specification (OAS) 使用 YAML/JSON，tApi 利用 TypeScript 的类型系统来定义 API。

tApi 是一个优雅的 API 类型描述规范，借助 TypeScript 强大的类型系统，让 API 定义更自然、更具表现力。完全兼容 OpenAPI 3.0 规范，让您在享受类型系统优势的同时，还能无缝对接现有工具生态。

### 核心特性

- **TypeScript 语法定义 API**：用 class 定义数据模型，用 type 定义 API 操作。利用 TypeScript 类型系统提供完整的类型检查和推导能力。

- **优雅的元数据注解**：支持 JSDoc、装饰器和行内注释三种方式添加元数据。可选字段、默认值等特性让 API 定义更加灵活。

- **站在巨人的肩膀上**：完整支持 OpenAPI 3.0 规范，在享受类型系统优势的同时，无缝对接现有工具生态。

- **开发者友好**：享受 IDE 的智能提示、类型检查和代码重构能力。纯文本的 .ts 文件让版本控制和团队协作更加自然。

## 数据类型定义

> 在 OAS 中，这部分内容对应 Schema Objects，用于描述数据结构。

### 基础类型

内置类型别名提供了常用的数据类型定义：

```typescript
type int32 = number; // { type: "integer", format: "int32" }
type int64 = number; // { type: "integer", format: "int64" }
type float = number; // { type: "number", format: "float" }
type double = number; // { type: "number", format: "double" }
type binary = string; // { type: "string", format: "binary" }
type date = string; // { type: "string", format: "date" }
type datetime = string; // { type: "string", format: "date-time" }
```

### 数据模型

使用 `class` 关键字定义数据模型：

```typescript
class Pet {
  id: int64 = 0;
  name: string;
  status: Status;
  tags?: Tag[];
}
```

#### 枚举类型

使用联合字面量类型定义枚举值：

```typescript
type Status = "placed" | "approved" | "delivered";
```

#### 字段修饰

- 可选字段：使用 `?` 标记
- 默认值：使用 `=` 赋值
- 数组类型：使用 `[]` 后缀

## API 操作定义

> 在 OAS 中，API 操作通过 Path Item Object 和 Operation Object 的组合来描述。tApi 采用更直观的方式，用单个类型定义来表达完整的 API 操作。

任何包含 `url` 字段的类型定义都会被识别为 API 操作：

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

### HTTP 方法

支持标准 HTTP 方法：

- GET
- POST
- PUT
- DELETE
- PATCH
- HEAD
- OPTIONS

### 参数定义

#### 路径参数 (Path Parameters)

```typescript
type getPet = {
  url: "/pets/:id";
  path: {
    id: Pet["id"]; // 可以引用数据模型中的类型
  };
};
```

#### 查询参数 (Query Parameters)

```typescript
type listPets = {
  url: "/pets";
  query: {
    status?: Status; // 可以使用可选参数
    limit?: number;
  };
};
```

#### 请求头 (Headers)

```typescript
type securePet = {
  headers: {
    "api-key": string;
  };
};
```

### 请求体 (Request Body)

使用 `body` 字段定义请求体，支持复用数据模型：

```typescript
type updatePet = {
  method: "PUT";
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

## 与 OpenAPI 的关系

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

## 开发者体验

由于采用 TypeScript 语法，tApi 定义可以获得：

1. IDE 智能提示和类型检查
2. 代码跳转和重构
3. 注释和文档生成
4. TypeScript 生态系统工具支持

## 与 OpenAPI 的对比

1. 语法更自然：使用 TypeScript 类型系统替代 JSON Schema
2. 更好的类型安全：编译时类型检查
3. 更强的可维护性：支持代码重构和跳转
4. 更好的开发体验：IDE 支持和类型提示
5. 更灵活的类型复用：支持完整的 TypeScript 类型系统

## 规范扩展

tApi 规范可以通过以下方式扩展：

1. 自定义内置类型
2. 扩展元数据注解
3. 自定义响应类型
4. 添加新的操作字段
