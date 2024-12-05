import {
  ClassDeclaration,
  Node,
  PropertyDeclaration,
  PropertySignature,
  TypeAliasDeclaration,
} from "ts-morph";

/**
 * 获取节点的额外信息，包括装饰器、JSDoc注释、前置注释和后置注释
 * @param node 支持的节点类型：ClassDeclaration、PropertyDeclaration、TypeAliasDeclaration、PropertySignature
 * @returns 返回解析后的节点信息对象
 */
export const getNodeExtraInfo = (
  node:
    | ClassDeclaration
    | PropertyDeclaration
    | TypeAliasDeclaration
    | PropertySignature
) => {
  // class 和 class 属性才有 decorator
  const decorators =
    Node.isClassDeclaration(node) || Node.isPropertyDeclaration(node)
      ? node.getDecorators().reduce((map, dec) => {
          const propName = dec.getName();
          const propValue = dec
            .getArguments()
            .map((arg) => {
              return arg.getFullText();
            })
            .join("/");
          map[propName] = propValue;
          return map;
        }, {} as Record<string, string>)
      : {};

  /**
   * 注意!! 不支持 @type
   * @see https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
   */
  const jsDocs = node.getJsDocs().reduce((map, doc) => {
    const tags = doc
      .getTags()
      .filter((tag) => Node.isJSDocTag(tag) || Node.isJSDocDeprecatedTag(tag))
      .reduce((tmap, tag) => {
        tmap[tag.getTagName()] = tag.getCommentText();
        return tmap;
      }, {});

    return { ...map, ...tags };
  }, {} as Record<string, string>);

  const leadingComment = node
    .getLeadingCommentRanges()
    .map((cmm) => {
      return cmm.getText();
    })
    .join("\n");

  const trailingComment = node
    .getTrailingCommentRanges()
    .map((cmm) => {
      return cmm.getText();
    })
    .join("\n");

  // 优先级：JSDoc description > 装饰器 description > 前置注释 > 后置注释
  const desc =
    jsDocs.description ||
    decorators.description ||
    leadingComment ||
    trailingComment;

  const merged = {
    ...jsDocs,
    ...decorators,
  };

  if (desc) {
    merged.description = desc;
  }

  return { decorators, jsDocs, leadingComment, trailingComment, merged };
};
