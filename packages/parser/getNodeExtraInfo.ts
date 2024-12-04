import {
  ClassDeclaration,
  Node,
  PropertyDeclaration,
  PropertySignature,
  TypeAliasDeclaration,
} from "ts-morph";

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

  // 填充 json schema 定义, 当然害需要一个白名单
  const merged = {
    ...jsDocs,
    ...decorators,
    description:
      jsDocs.description ||
      decorators.description ||
      leadingComment ||
      trailingComment,
  };
  return { decorators, jsDocs, leadingComment, trailingComment, merged };
};
