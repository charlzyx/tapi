import {
  ClassDeclaration,
  Node,
  Project,
  TypeAliasDeclaration,
} from "ts-morph";

const IgnoreRuleKeys = {
  jsDoc: ["ignore", "WIP", "Draft"],
  classDecorators: ["ignore", "WIP", "Draft"],
  leadingComment: ["@ignore", "@WIP", "@Draft"],
};
import { getNodeExtraInfo } from "./getNodeExtraInfo";

const shouldSkip = (node: ClassDeclaration | TypeAliasDeclaration) => {
  const { decorators, jsDocs, leadingComment } = getNodeExtraInfo(node);
  // 在 class 的装饰器中 有忽略标签
  const skipByDecorator =
    Object.keys(decorators).findIndex((decoratorName) =>
      IgnoreRuleKeys.classDecorators.includes(decoratorName)
    ) > -1;
  if (skipByDecorator) return true;

  // 在jsDoc 中使用了 @ignore tag
  const skipByJsDoc =
    Object.keys(jsDocs).findIndex((tagName) =>
      IgnoreRuleKeys.jsDoc.includes(tagName)
    ) > -1;

  if (skipByJsDoc) return true;
  // 前方单行或多行出现了忽略标志
  const skipByComment =
    leadingComment
      .split(/s+/)
      .findIndex((word) => IgnoreRuleKeys.leadingComment.includes(word)) > -1;
  if (skipByComment) return true;
};

export const getDtsNodes = (project: Project) => {
  const typings: TypeAliasDeclaration[] = [];
  const definitions: ClassDeclaration[] = [];
  const operations: TypeAliasDeclaration[] = [];
  const unique = {} as Record<string, TypeAliasDeclaration>;

  project.getSourceFiles().forEach((sourceFile) => {
    // const filePath = sourceFile.getFilePath();
    //  .d.ts 文件
    if (sourceFile.isDeclarationFile()) {
      sourceFile.getStatements().forEach((statement) => {
        // 获取自定义泛型文件
        // type alias
        if (Node.isTypeAliasDeclaration(statement)) {
          if (shouldSkip(statement)) return;
          const typeParams = statement.getTypeParameters();
          // 并且有泛型参数
          if (typeParams.length > 0) {
            typings.push(statement);
          }
        }
        // TODO： 需要什么特殊条件来过滤吗
        if (Node.isClassDeclaration(statement)) {
          if (shouldSkip(statement)) return;
          definitions.push(statement);
        }
      });
    } else {
      //  .ts 文件
      sourceFile.getStatements().forEach((statement) => {
        // 在同一个文件中写 class 也是合理的吧， 就看类型报不报错了
        if (Node.isClassDeclaration(statement)) {
          if (shouldSkip(statement)) return;
          definitions.push(statement);
        }
        // TODO： 需要什么特殊条件来过滤吗
        // 必须是 type alias = {}
        if (Node.isTypeAliasDeclaration(statement)) {
          const typ = statement.getTypeNode();
          if (shouldSkip(statement)) return;
          // 必须事 TypeLiteral 字面量定义
          if (Node.isTypeLiteral(typ)) {
            const operation = statement;
            // 必须有 url字段
            const hasUrl = operation.getType().getProperty("url");
            if (hasUrl) {
              const name = operation.getName();
              if (unique[name]) {
                throw new Error(
                  "Api 操作定义出现了重复" +
                    name +
                    "重复定义所在文件: " +
                    unique[name].getSourceFile().getFilePath()
                );
              }
              operations.push(operation);
              unique[name] = operation;
            }
          }
        }
      });
    }
  });

  return {
    typings,
    definitions,
    operations,
  };
};
