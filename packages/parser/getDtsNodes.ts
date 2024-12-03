import {
  ClassDeclaration,
  Node,
  Project,
  TypeAliasDeclaration,
} from "ts-morph";

const SkipRuleKeys = {
  jsDoc: ["ignore", "WIP", "Draft"],
  classDecorators: ["ignore", "WIP", "Draft"],
  leadingComment: ["@ignore", "@WIP", "@Draft"],
};

const sholudIgnore = (node: ClassDeclaration | TypeAliasDeclaration) => {
  // 在jsDoc 中使用了 @ignore tag
  const jsDocIgnore = node.getJsDocs().find((doc) => {
    const hasIgnoreTag = doc.getTags().find((tag) => {
      const tagname = tag.getTagName();
      return SkipRuleKeys.jsDoc.includes(tagname);
    });
    return hasIgnoreTag;
  });

  // 前方单行或多行 // 格式的注释中出现了 @ignore @WIP @Draft 这样的标志
  const leadingCmmIgnore = node.getLeadingCommentRanges().find((cmmNode) => {
    const cmmText = cmmNode.getText();
    const match = SkipRuleKeys.leadingComment.find((flag) =>
      cmmText.includes(flag)
    );
    return match;
  });

  if (jsDocIgnore || leadingCmmIgnore) return true;

  // 针对 class 语法， 添加装饰器支持
  if (Node.isClassDeclaration(node)) {
    const decorators = node.getDecorators();
    const ignore = decorators.find((decorator) => {
      return SkipRuleKeys.classDecorators.includes(decorator.getName());
    });
    return ignore ? true : false;
  }
};

export const getDtsNodes = (project: Project) => {
  const typings = {} as Record<string, TypeAliasDeclaration>;
  const datas = {} as Record<string, ClassDeclaration>;
  const operations = {} as Record<string, TypeAliasDeclaration>;

  project.getSourceFiles().forEach((sourceFile) => {
    // const filePath = sourceFile.getFilePath();
    //  .d.ts 文件
    if (sourceFile.isDeclarationFile()) {
      sourceFile.getStatements().forEach((statement) => {
        // 获取自定义泛型文件
        // type alias
        if (Node.isTypeAliasDeclaration(statement)) {
          if (sholudIgnore(statement)) return;
          const typeParams = statement.getTypeParameters();
          // 并且有泛型参数
          if (typeParams.length > 0) {
            const alias = statement;
            const name = alias.getName();
            typings[name] = alias;
          }
        }
        // TODO： 需要什么特殊条件来过滤吗
        if (Node.isClassDeclaration(statement)) {
          if (sholudIgnore(statement)) return;
          const clz = statement;
          const name = clz.getName();
          datas[name] = clz;
        }
      });
    } else {
      //  .ts 文件
      sourceFile.getStatements().forEach((statement) => {
        // 在同一个文件中写 class 也是合理的吧， 就看类型报不报错了
        if (Node.isClassDeclaration(statement)) {
          if (sholudIgnore(statement)) return;
          const clz = statement;
          const name = clz.getName();
          datas[name] = clz;
        }
        // TODO： 需要什么特殊条件来过滤吗
        // 必须是 type alias = {}
        if (Node.isTypeAliasDeclaration(statement)) {
          const typ = statement.getTypeNode();
          if (sholudIgnore(statement)) return;
          // 必须事 TypeLiteral 字面量定义
          if (Node.isTypeLiteral(typ)) {
            const operation = statement;
            // 必须有 url字段
            const hasUrl = operation.getType().getProperty("url");
            if (hasUrl) {
              const name = operation.getName();
              if (/cannotseeme/.test(name)) {
                console.log(name);
              }
              operations[name] = operation;
            }
          }
        }
      });
    }
  });

  return {
    typings,
    datas,
    operations,
  };
};
