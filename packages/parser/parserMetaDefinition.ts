import {
  Project,
  TypeParameterDeclaration,
  TypeAliasDeclaration,
  Symbol,
} from "ts-morph";

export const parserMetaDefinition = (project: Project) => {
  const meta = {} as Record<
    string,
    {
      symbol: Symbol | undefined;
      params: TypeParameterDeclaration[];
    }
  >;

  project.getSourceFiles().forEach((sourceFile) => {
    if (!sourceFile.isDeclarationFile()) return;
    sourceFile.getStatements().forEach((statement) => {
      const kindName = statement.getKindName();
      const name = statement.getSymbol()?.getName();
      if ("TypeAliasDeclaration" === kindName) {
        const typeAliasDeclaration = statement as TypeAliasDeclaration;
        meta[name] = {
          symbol: typeAliasDeclaration.getSymbol(),
          params: typeAliasDeclaration.getTypeParameters(),
        };
      }
    });
  });
};
