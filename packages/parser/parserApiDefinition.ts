import {
  PropertyDeclaration,
  SourceFile,
  SyntaxKind,
  Type,
  TypeAliasDeclaration,
} from "ts-morph";
import { parserGenericDefinition } from "./parserGenericDefinition";

const HTTP_METHODS = /get|post|put|del|option|trace/i;

const resolveProps = (
  props: Array<{ type: string } | { type: string; [x: string]: any }[]>
) => {
  // length > 1 means union
  const only = props.length === 1;
  const one = props[0];

  const isTypeAliasUnionEnum =
    only && Array.isArray(one) && one.every((x) => x.type === "literal");

  if (isTypeAliasUnionEnum) {
    return {
      type: "string",
      enums: one.map((item) => item.value!),
    };
  } else if (only) {
    return one;
  }
  return props;
};

const markRefIfHas = (type: Type) => {
  const maybe = type.getSymbol()?.getValueDeclaration?.();

  if (
    maybe &&
    (maybe.isKind(SyntaxKind.ClassDeclaration) ||
      maybe.isKind(SyntaxKind.InterfaceDeclaration))
  ) {
    return {
      name: maybe.getName(),
      ref: maybe,
    };
  }
};

const resolveType = (
  type: Type,
  genericDts: ReturnType<typeof parserGenericDefinition>
) => {
  const base = {
    _ref: markRefIfHas(type),
  };

  if (type.isString()) {
    return { type: "string", ...base };
  }
  if (type.isNumber()) {
    return { type: "number", ...base };
  }
  if (type.isBoolean() || type.isBooleanLiteral()) {
    return { type: "boolean", ...base };
  }
  if (type.isLiteral()) {
    return { type: "literal", value: type.getLiteralValue(), ...base };
  }
  if (type.isArray()) {
    const item = type.getArrayElementType();
    return { type: "array", items: resolveType(item, genericDts) };
  }
  if (type.isUnion()) {
    // Array means union
    return type
      .getUnionTypes()
      .map((subType) => resolveType(subType, genericDts));
  }
  if (type.isObject() || type.isClassOrInterface() || type.isIntersection()) {
    const propertiesSymbols = type.getProperties();
    const props = propertiesSymbols.map((symbol) => {
      const name = symbol.getName();
      const node = symbol.getValueDeclaration() as unknown as
        | PropertyDeclaration
        | undefined;
      if (node) {
        const fullType = symbol.getTypeAtLocation(node);
        const resolved = resolveType(fullType, genericDts);
        return {
          [name]: resolveProps(resolved),
        };
      } else {
        const dnodes = symbol.getDeclarations();
        const resolved = dnodes.map((node) =>
          resolveType(node.getType(), genericDts)
        );
        return {
          [name]: resolveProps(resolved),
        };
      }
    });
    return { type: "object", properties: props };
  }
};

export const parserApiDefinition = (
  sourceFiles: SourceFile[],
  genericDts: ReturnType<typeof parserGenericDefinition>
) => {
  const apiDefList = [];
  sourceFiles.forEach((sourceFile) => {
    if (sourceFile.isDeclarationFile()) return;
    // type alias node list
    const typeAliasDeclarations = sourceFile
      .getStatements()
      .filter((statement) => {
        return (
          SyntaxKind.TypeAliasDeclaration === statement.getKind() &&
          HTTP_METHODS.test((statement as TypeAliasDeclaration).getName())
        );
      }) as TypeAliasDeclaration[];
    typeAliasDeclarations.forEach((node) => {
      const type = node.getSymbol().getDeclaredType();
      const ret = resolveType(type, genericDts);
      apiDefList.push(ret);
    });
  });
  return apiDefList;
};
