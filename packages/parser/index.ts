import { parserApiDefinition } from "./parserApiDefinition";
import { parserGenericDefinition } from "./parserGenericDefinition";
import { JsonSchemaDraft07 } from "@hyperjump/json-schema/draft-07";

import * as path from "path";
import * as fs from "fs";

import {
  SymbolFlags,
  Node,
  Project,
  Symbol,
  Type,
  PropertySignature,
  TypeAliasDeclaration,
  TypeParameterDeclaration,
  ClassDeclaration,
  PropertyDeclaration,
  TypeNode,
} from "ts-morph";
import { getDtsNodes } from "./getDtsNodes";
import { getNodeExtraInfo } from "./getNodeExtraInfo";

// const resolveType = (
//   typ: Type,
//   clzNameMap: WeakMap<ClassDeclaration, string>
// ): JsonSchemaDraft07 => {
//   return {
//     type: "object",
//   };
// };

const resolveType = (info: {
  type: Type;
  typeNode?: TypeNode;
  defNameMap: WeakMap<ClassDeclaration, string>;
  extra?: Record<string, string>;
}): JsonSchemaDraft07 | JsonSchemaDraft07[] => {
  const { type, defNameMap, extra = {}, typeNode } = info;
  let typeName: string | undefined;

  if (typeNode) {
    if (Node.isTypeReference(typeNode)) {
      typeName = typeNode.getTypeName().getText();

      const symbol = type.getSymbol();

      if (symbol) {
        const declarations = symbol.getDeclarations();
        let refName = null;
        declarations.forEach((dec) => {
          if (Node.isClassDeclaration(dec) && defNameMap.has(dec)) {
            refName = defNameMap.get(dec);
          }
        });

        if (refName) {
          return {
            $ref: "#" + refName,
          };
        }
      }
    }
    if (Node.isTypeLiteral(typeNode)) {
      return {
        ...extra,
        type: "object",
        properties: typeNode.getProperties().reduce((map, prop) => {
          const extra = getNodeExtraInfo(prop);
          map[prop.getName()] = resolveType({
            type: prop.getType(),
            typeNode: prop.getTypeNode(),
            defNameMap,
            extra: extra.merged,
          });
          return map;
        }, {}),
      };
    }
  }

  if (type.isString()) {
    return { ...extra, type: "string", $comment: typeName };
  }

  if (type.isNumber()) {
    return { ...extra, type: "number", $comment: typeName };
  }

  if (type.isBoolean() || type.isBooleanLiteral()) {
    return { ...extra, type: "boolean", $comment: typeName };
  }

  if (type.isLiteral()) {
    return {
      ...extra,
      type: "string",
      $comment: typeName,
      const: type.getLiteralValue().toString(),
    };
  }

  if (type.isArray()) {
    return {
      ...extra,
      type: "array",
      $comment: typeName,
      items: resolveType({
        type: type.getArrayElementType(),
        defNameMap,
      }),
    };
  }

  // Array 意味着是 union 类型
  if (type.isUnion()) {
    return type.getUnionTypes().map(
      (subType) =>
        resolveType({
          type: subType,
          defNameMap,
          extra,
        }) as JsonSchemaDraft07
    );
  }

  if (type.isClassOrInterface()) {
    return {
      ...extra,
      type: "object",
      $comment: typeName,
      properties: type.getProperties().reduce((map, propSymbol) => {
        return map;
      }, {}),
    };
  }
};

const parseDefinitions = (definitions: ClassDeclaration[]) => {
  const defSchema = {} as Record<string, JsonSchemaDraft07>;
  const defNameMap = new WeakMap();
  for (const def of definitions) {
    let clzName = def.getName();
    // rename and link, 根据所在文件和数字名称重命名
    if (defSchema[clzName]) {
      const atFile = def.getSourceFile().getFilePath();
      clzName = clzName + "_At_" + path.basename(atFile);
      let acc = 0;
      const baseName = clzName;

      while (defSchema[clzName]) {
        acc = acc + 1;
        clzName = baseName + acc;
      }
    }
    defNameMap.set(def, clzName);
  }

  for (const def of definitions) {
    const extra = getNodeExtraInfo(def);
    let clzName = defNameMap.get(def);
    const schema: JsonSchemaDraft07 = {
      ...extra.merged,
      type: "object",
      properties: def.getProperties().reduce((map, prop) => {
        const extra = getNodeExtraInfo(prop);
        map[prop.getName()] = resolveType({
          type: prop.getType(),
          typeNode: prop.getTypeNode(),
          defNameMap: defNameMap,
          extra: extra.merged,
        });
        return map;
      }, {}),
    };

    defSchema[clzName] = schema;
  }

  return { defSchema, defNameMap };
};

const parseOperations = (
  operations: TypeAliasDeclaration[],
  defNameMap: WeakMap<ClassDeclaration, string>
) => {
  const defMap = {} as Record<string, JsonSchemaDraft07>;

  for (const operation of operations) {
    const extra = getNodeExtraInfo(operation);
    const typeNode = operation.getTypeNode();
    if (Node.isTypeLiteral(typeNode)) {
      const schema: JsonSchemaDraft07 = {
        ...extra.merged,
        type: "object",
        properties: typeNode.getProperties().reduce((map, prop) => {
          const extra = getNodeExtraInfo(prop);
          map[prop.getName()] = resolveType({
            type: prop.getType(),
            typeNode: prop.getTypeNode(),
            defNameMap,
            extra: extra.merged,
          });
          return map;
        }, {}),
      };

      defMap[operation.getName()] = schema;
    }
  }

  return defMap;
};

export const parser = (project: Project) => {
  const { definitions, operations, typings } = getDtsNodes(project);
  fs.writeFileSync(path.resolve(".debug/defs.json"), "", "utf-8");
  fs.writeFileSync(path.resolve(".debug/ops.json"), "", "utf-8");
  const { defSchema, defNameMap } = parseDefinitions(definitions);
  const opSchema = parseOperations(operations, defNameMap);
  fs.writeFileSync(
    path.resolve(".debug/defs.json"),
    JSON.stringify(defSchema, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.resolve(".debug/ops.json"),
    JSON.stringify(opSchema, null, 2),
    "utf-8"
  );
  console.log("🚀 ~ parser ~ meta:");
};

// import * as fs from "fs";

// const project = new Project({});
// project.addSourceFilesAtPaths("./example/*.d.ts");
// project.addSourceFilesAtPaths("./example/**/*.ts");

// const isNode = (typeNode: any): typeNode is Node =>
//   typeof typeNode?.getType === "function";

// const getTypeOfNodeOrType = (typeNode: Node | Type): Type | undefined => {
//   if (isNode(typeNode)) {
//     return typeNode.getType();
//   } else {
//     return typeNode;
//   }
// };

// const arrayToMap = (maybe) => {
//   if (Array.isArray(maybe)) {
//     return maybe.reduce((map, item) => {
//       map = { ...map, ...item };
//       return map;
//     }, {});
//   }
//   return maybe;
// };

// const mergeProps = (
//   props: Array<{ type: string } | { type: string; [x: string]: any }[]>,
//   isOptional: boolean,
//   jsDoc: Record<string, string>
// ) => {
//   // length > 1 means union
//   const only = props.length === 1;
//   const one = props[0];
//   const isTypeAliasUnionEnum =
//     Array.isArray(one) && one.every((x) => x.type === "literal");
//   if (isTypeAliasUnionEnum) {
//     return {
//       type: "string",
//       enums: one.map((item) => item.value!),
//       isOptional: isOptional ? true : undefined,
//       jsDoc,
//     };
//   } else if (only) {
//     return {
//       ...one,
//       isOptional: isOptional ? true : undefined,
//       jsDoc,
//     };
//   }
//   return props;
// };

// type Wrapper = {
//   resp: null | {
//     name: string;
//     symbol: Symbol;
//     params: TypeParameterDeclaration[];
//   };
//   reason: null | {
//     name: string;
//     symbol: Symbol;
//     params: TypeParameterDeclaration[];
//   };
// };

// const getWrapper = () => {
//   const ans: Wrapper = { resp: null, reason: null };
//   project.getSourceFiles().forEach((sourceFile) => {
//     if (!sourceFile.isDeclarationFile()) return;
//     const respTypeAliasDeclaration = sourceFile
//       .getStatements()
//       .find((statement) => {
//         const kindName = statement.getKindName();
//         const name = statement.getSymbol()?.getName();
//         return "TypeAliasDeclaration" === kindName && /Resp/i.test(name!);
//       }) as TypeAliasDeclaration | undefined;
//     const reasonTypeAliasDeclaration = sourceFile
//       .getStatements()
//       .find((statement) => {
//         const kindName = statement.getKindName();
//         const name = statement.getSymbol()?.getName();
//         return "TypeAliasDeclaration" === kindName && /Reason/i.test(name!);
//       }) as TypeAliasDeclaration | undefined;
//     if (respTypeAliasDeclaration && reasonTypeAliasDeclaration) {
//       const resp = {
//         name: respTypeAliasDeclaration.getName(),
//         symbol: respTypeAliasDeclaration.getSymbol(),
//         params: respTypeAliasDeclaration.getTypeParameters(),
//       };
//       const reason = {
//         name: reasonTypeAliasDeclaration.getName(),
//         symbol: reasonTypeAliasDeclaration.getSymbol(),
//         params: reasonTypeAliasDeclaration.getTypeParameters(),
//       };
//       console.log({ respTypeAliasDeclaration, reasonTypeAliasDeclaration });
//       ans.resp = resp;
//       ans.reason = reason;
//     }
//   });
//   return ans;
// };

// const wrapper = getWrapper();

// const parserTypeNode = (typeNode: Node | Type): any => {
//   const type = getTypeOfNodeOrType(typeNode);

//   if (!type) return "notype";

//   const base = {
//     _class: type
//       .getSymbol()
//       ?.getValueDeclaration?.()
//       ?.getType()
//       ?.getApparentType()
//       ?.getText(),
//   };

//   console.log("base", base);

//   if (type.isString()) return { type: "string", ...base };
//   if (type.isBoolean()) return { type: "boolean", ...base };
//   if (type.isNumber()) return { type: "number", ...base };
//   if (type.isLiteral())
//     return { type: "literal", value: type.getLiteralValue(), ...base };

//   if (type.isArray()) {
//     const item = type.getArrayElementTypeOrThrow();
//     return { type: "array", items: parserTypeNode(item), ...base };
//   }

//   if (type.isUnion()) {
//     // Array means union
//     return type.getUnionTypes().map(parserTypeNode);
//   }

//   if (type.isObject() || type.isClassOrInterface() || type.isIntersection()) {
//     const aliasSymbol = type.getAliasSymbol();
//     const { resp, reason } = wrapper;
//     if (aliasSymbol === resp?.symbol) {
//       const aliasParams = type.getAliasTypeArguments();
//       const symbolParams = resp.params;
//       console.log({ aliasParams, symbolParams });
//     }
//     if (aliasSymbol === reason?.symbol) {
//       const aliasParams = type.getAliasTypeArguments();
//       const symbolParams = reason.params;
//       console.log({ aliasParams, symbolParams });
//     }

//     const props = type.getProperties().map((propSymbol) => {
//       const name = propSymbol.getName();

//       const node = propSymbol.getValueDeclaration();
//       const isOptional = propSymbol.hasFlags(SymbolFlags.Optional);
//       const jsDoc = propSymbol.getJsDocTags()?.reduce((map, tag) => {
//         map = map || {};
//         map[tag.getName()] = tag.getText();
//         return map;
//       }, undefined as any);

//       if (node) {
//         const stype = propSymbol.getTypeAtLocation(node);
//         const init = (node as PropertySignature).getInitializer()?.getText();
//         const prop = parserTypeNode(stype);
//         return {
//           [name]: {
//             ...mergeProps([prop], isOptional, jsDoc),
//             init,
//           },
//         };
//       } else {
//         const dts = propSymbol.getDeclarations();
//         const subProps = dts.map(parserTypeNode);
//         return {
//           [name]: mergeProps(subProps, isOptional, jsDoc),
//         };
//       }
//     });

//     return {
//       type: "object",
//       properties: arrayToMap(props),
//       ...base,
//     };
//   }
// };
// const parserMethodTypeAliasDeclaration = (signature: Type) => {
//   const props = [
//     "url",
//     "headers",
//     "cookies",
//     "path",
//     "query",
//     "body",
//     "resp",
//   ].reduce((map, key) => {
//     const symbol = signature.getSymbol()?.getMember?.(key);
//     const typeNode = symbol?.getValueDeclaration();
//     if (typeNode) {
//       map[key] = parserTypeNode(typeNode);
//     }

//     return map;
//   }, {} as Record<string, Symbol | undefined>);
//   return props;
// };

// fs.writeFileSync("./ret.json", "", "utf-8");

// const apis: any[] = [];

// project.getSourceFiles().forEach((sourceFile) => {
//   if (sourceFile.isDeclarationFile()) return;

//   // get method type declaration
//   const methodTypeAliasDeclaration = sourceFile
//     .getStatements()
//     .find((statement) => {
//       const kindName = statement.getKindName();
//       const name = statement.getSymbol()?.getName();
//       return (
//         "TypeAliasDeclaration" === kindName &&
//         /get|post|put|del|option|trace/i.test(name!)
//       );
//     }) as TypeAliasDeclaration | undefined;
//   if (!methodTypeAliasDeclaration) return;
//   const methodType = methodTypeAliasDeclaration.getSymbol()?.getDeclaredType();
//   if (!methodType) return;
//   const api = parserMethodTypeAliasDeclaration(methodType);
//   apis.push(api);

//   console.log(api);
// });

// const output = () => {
//   console.log("apis", apis);
//   fs.appendFileSync("./ret.json", JSON.stringify(apis, null, 2), "utf-8");
// };
// output();
