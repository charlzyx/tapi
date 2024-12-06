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
  // 获取装饰器信息，仅适用于类和类属性
  const decorators =
    Node.isClassDeclaration(node) || Node.isPropertyDeclaration(node)
      ? node.getDecorators().reduce((map, dec) => {
          const propName = dec.getName();
          const propValue = dec
            .getArguments()
            .map((arg) => arg.getFullText())
            .join("/");
          map[propName] = propValue;
          return map;
        }, {} as Record<string, string>)
      : {};

  // 获取JSDoc标签信息，注意不支持 @type
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

  // 获取前置注释，若存在则取最后一行
  const leadingComment = node.getLeadingCommentRanges().pop()?.getText() ?? "";

  // 获取所有后置注释并合并为一个字符串
  const trailingComment = node
    .getTrailingCommentRanges()
    .map((cmm) => cmm.getText())
    .join("\n");

  // 优先级：JSDoc description > 装饰器 description > 前置注释 > 后置注释
  const desc =
    jsDocs.description ||
    decorators.description ||
    leadingComment ||
    trailingComment;

  // 合并所有信息
  const merged = {
    ...jsDocs,
    ...decorators,
  };

  // 如果存在描述，则添加到合并对象中
  if (desc) {
    merged.description = desc;
  }

  return { decorators, jsDocs, leadingComment, trailingComment, merged };
};
