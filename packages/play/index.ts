import {
  SymbolFlags,
  Node,
  Project,
  Symbol,
  Type,
  PropertySignature,
  TypeAliasDeclaration,
} from "ts-morph";
import { parserApiDefinition } from "@tapi/parser";
import { parserGenericDefinition } from "@tapi/parser";

const project = new Project({});
project.addSourceFilesAtPaths("./example/*.d.ts");
project.addSourceFilesAtPaths("./example/**/*.ts");

const sourceFiles = project.getSourceFiles();

const dts = parserGenericDefinition(sourceFiles);
const ret = parserApiDefinition(sourceFiles, dts);
