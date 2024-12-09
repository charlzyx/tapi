import { Node } from 'ts-morph';

/**
 * 获取节点的额外信息，包括装饰器、JSDoc注释、前置注释和后置注释
 * @param node 支持的节点类型：ClassDeclaration、PropertyDeclaration、TypeAliasDeclaration、PropertySignature
 * @returns 返回解析后的节点信息对象
 */
const getNodeExtraInfo = (node) => {
    var _a, _b;
    // 获取装饰器信息，仅适用于类和类属性
    const decorators = Node.isClassDeclaration(node) || Node.isPropertyDeclaration(node)
        ? node.getDecorators().reduce((map, dec) => {
            const propName = dec.getName();
            const propValue = dec
                .getArguments()
                .map((arg) => arg.getFullText())
                .join("/");
            map[propName] = propValue;
            return map;
        }, {})
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
        return Object.assign(Object.assign({}, map), tags);
    }, {});
    // 获取前置注释，若存在则取最后一行
    const leadingComment = (_b = (_a = node.getLeadingCommentRanges().pop()) === null || _a === void 0 ? void 0 : _a.getText()) !== null && _b !== void 0 ? _b : "";
    // 获取所有后置注释并合并为一个字符串
    const trailingComment = node
        .getTrailingCommentRanges()
        .map((cmm) => cmm.getText())
        .join("\n");
    // 优先级：JSDoc description > 装饰器 description > 前置注释 > 后置注释
    const desc = jsDocs.description ||
        decorators.description ||
        leadingComment ||
        trailingComment;
    // 合并所有信息
    const merged = Object.assign(Object.assign({}, jsDocs), decorators);
    // 如果存在描述，则添加到合并对象中
    if (desc) {
        merged.description = desc;
    }
    return { decorators, jsDocs, leadingComment, trailingComment, merged };
};

// 忽略规则的键
const IgnoreRuleKeys = {
    jsDoc: ["ignore", "WIP", "Draft"],
    classDecorators: ["ignore", "WIP", "Draft"],
    leadingComment: ["@ignore", "@WIP", "@Draft"],
};
// 判断是否应跳过该节点
const shouldSkip = (node) => {
    const { decorators, jsDocs, leadingComment } = getNodeExtraInfo(node);
    // 检查装饰器中是否有忽略标签
    const skipByDecorator = Object.keys(decorators).findIndex((decoratorName) => IgnoreRuleKeys.classDecorators.includes(decoratorName)) > -1;
    if (skipByDecorator)
        return true;
    // 检查 jsDoc 中是否有忽略标签
    const skipByJsDoc = Object.keys(jsDocs).findIndex((tagName) => IgnoreRuleKeys.jsDoc.includes(tagName)) > -1;
    if (skipByJsDoc)
        return true;
    // 检查前导注释中是否有忽略标签
    const skipByComment = leadingComment
        .split(/\s+/)
        .findIndex((word) => IgnoreRuleKeys.leadingComment.includes(word)) > -1;
    if (skipByComment)
        return true;
    return false; // 如果没有任何忽略标签，返回 false
};
// 获取项目中的 d.ts 节点
const getDtsNodes = (project) => {
    const typings = [];
    const definitions = [];
    const operations = [];
    const unique = {};
    project.getSourceFiles().forEach((sourceFile) => {
        sourceFile.getStatements().forEach((statement) => {
            // 处理类声明
            if (Node.isClassDeclaration(statement)) {
                if (shouldSkip(statement))
                    return; // 跳过被忽略的节点
                definitions.push(statement);
            }
            // 处理类型别名声明
            if (Node.isTypeAliasDeclaration(statement)) {
                const typ = statement.getTypeNode();
                if (shouldSkip(statement))
                    return; // 跳过被忽略的节点
                // 如果是带有泛型的说明是一些辅助类型定义, 虽然暂时没有什么用, 但是先保起来
                const typeParams = statement.getTypeParameters();
                // 仅处理有泛型参数的类型别名
                if (typeParams.length > 0) {
                    typings.push(statement);
                }
                // 否则就看是不是 ApiOperation 定义
                // 条件是必须是 TypeLiteral 字面量定义
                if (Node.isTypeLiteral(typ)) {
                    const operation = statement;
                    // 必须有 url 字段
                    const hasUrl = operation.getType().getProperty("url");
                    if (hasUrl) {
                        const name = operation.getName();
                        if (unique[name]) {
                            throw new Error("Api 操作定义出现了重复" +
                                name +
                                "重复定义所在文件: " +
                                unique[name].getSourceFile().getFilePath() +
                                ":" +
                                unique[name].getStartLineNumber() // 使用 getLine() 获取行号
                            );
                        }
                        operations.push(operation);
                        unique[name] = operation; // 记录唯一的操作
                    }
                }
            }
        });
    });
    return {
        typings,
        definitions,
        operations,
    };
};

const resolveLiteral = (type) => {
    if (type.isLiteral) {
        return {
            const: type.getLiteralValue(),
        };
    }
    else {
        return {};
    }
};
const resolveType = (info) => {
    const { type, defNameMap, extra = {}, circularRefs = new WeakMap(), } = info;
    // 输出调试信息,帮助理解类型结构
    // console.log("\n=== Resolving Type ===", debugType(type));
    // 收集类型的相关信息用于调试
    // const debug = collectDebugInfo(type, typeNode);
    const base = Object.assign(Object.assign(Object.assign({}, extra), { _code: type.getText() }), resolveLiteral(type));
    // 检测并处理循环引用
    if (circularRefs.has(type)) {
        return Object.assign(Object.assign({}, base), { $ref: circularRefs.get(type) });
    }
    if (type.getSymbol()) {
        // 检查属性类型是否是已定义的类型
        const maybeTypeDecl = type.getSymbol().getValueDeclaration();
        const isDefinedType = defNameMap.has(maybeTypeDecl);
        // 如果是已定义类型,使用引用
        if (isDefinedType) {
            return Object.assign(Object.assign({}, base), { $ref: "#" + defNameMap.get(maybeTypeDecl) });
        }
    }
    // 处理基本类型和字面量类型
    if (type.isString() || type.isStringLiteral()) {
        return Object.assign(Object.assign({}, base), { type: "string" });
    }
    if (type.isNumber() || type.isNumberLiteral()) {
        return Object.assign(Object.assign({}, base), { type: "number" });
    }
    if (type.isBoolean() || type.isBooleanLiteral()) {
        return Object.assign(Object.assign({}, base), { type: "boolean" });
    }
    // 处理其他字面量类型
    if (type.isLiteral()) {
        return Object.assign(Object.assign({}, base), { type: "string" });
    }
    // 处理数组类型
    if (type.isArray()) {
        return Object.assign(Object.assign({}, base), { type: "array", items: resolveType({
                type: type.getArrayElementType(),
                defNameMap,
                circularRefs,
            }) });
    }
    if (type.isUnion()) {
        circularRefs.set(type, type.getText());
        return Object.assign(Object.assign({}, base), { oneOf: type.getUnionTypes().map((subType) => resolveType({
                type: subType,
                defNameMap,
                extra,
                circularRefs,
            })) });
    }
    if (type.isIntersection()) {
        circularRefs.set(type, type.getText());
        return Object.assign(Object.assign({}, base), { type: "array", allOf: type.getIntersectionTypes().map((subType) => {
                return resolveType({
                    type: subType,
                    defNameMap,
                    extra,
                    circularRefs,
                });
            }) });
    }
    // 处理对象类型和交叉类型
    if (type.isObject()) {
        circularRefs.set(type, type.getText());
        return Object.assign(Object.assign({}, base), { type: "object", properties: type.getProperties().reduce((map, propSymbol) => {
                // const debug = collectDebugInfo(null, null, propSymbol);
                var _a, _b;
                // 获取属性的声明节点
                const propNode = (_a = propSymbol.getValueDeclaration()) !== null && _a !== void 0 ? _a : propSymbol.getDeclarations()[0];
                // 获取属性的类型
                const propType = propNode
                    ? propSymbol.getTypeAtLocation(propNode)
                    : propSymbol.getDeclaredType();
                // 检查属性类型是否是已定义的类型
                const maybeTypeDecl = (_b = propType.getSymbol()) === null || _b === void 0 ? void 0 : _b.getValueDeclaration();
                const isDefinedType = maybeTypeDecl && defNameMap.has(maybeTypeDecl);
                // 如果是已定义类型,使用引用
                if (isDefinedType) {
                    map[propSymbol.getName()] = {
                        $ref: "#" + defNameMap.get(maybeTypeDecl),
                    };
                    return map;
                }
                // 递归处理属性类型
                map[propSymbol.getName()] = resolveType({
                    type: propType,
                    defNameMap,
                    circularRefs,
                });
                return map;
            }, {}) });
    }
};
const parseDefinitions = (definitions) => {
    const defSchema = {};
    const defNameMap = new WeakMap();
    for (const def of definitions) {
        let clzName = def.getName();
        // 检查是否存在重复名称
        if (defSchema[clzName]) {
            const atFile = def.getSourceFile().getFilePath();
            const basechain = atFile.split("/");
            clzName =
                clzName + "_At_" + basechain[basechain.length - 1].replace(/\.w+/, "");
            let acc = 0;
            const baseName = clzName;
            // 生成唯一名称
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
        const schema = Object.assign(Object.assign({}, extra.merged), { type: "object", properties: def.getProperties().reduce((map, prop) => {
                const extra = getNodeExtraInfo(prop);
                map[prop.getName()] = resolveType({
                    type: prop.getType(),
                    defNameMap: defNameMap,
                    extra: extra.merged,
                });
                return map;
            }, {}) });
        defSchema[clzName] = schema;
    }
    return { defSchema, defNameMap };
};
const parseOperations = (operations, defNameMap) => {
    const defMap = {};
    for (const operation of operations) {
        const extra = getNodeExtraInfo(operation);
        const typeNode = operation.getTypeNode();
        if (Node.isTypeLiteral(typeNode)) {
            const schema = Object.assign(Object.assign({}, extra.merged), { type: "object", properties: typeNode.getProperties().reduce((map, prop) => {
                    const extra = getNodeExtraInfo(prop);
                    map[prop.getName()] = resolveType({
                        type: prop.getType(),
                        defNameMap,
                        extra: extra.merged,
                    });
                    return map;
                }, {}) });
            defMap[operation.getName()] = schema;
        }
    }
    return defMap;
};

export { getDtsNodes, getNodeExtraInfo, parseDefinitions, parseOperations };
