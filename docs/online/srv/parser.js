import { Project } from "ts-morph";
import { getDtsNodes, parseDefinitions, parseOperations } from "./tsaid.js";

export const parser = () => {
  const project = new Project({});
  const args = ["./input.ts"];
  args.forEach((glob) => {
    project.addSourceFilesAtPaths(glob);
  });
  const { definitions, operations } = getDtsNodes(project);
  const { defSchema, defNameMap } = parseDefinitions(definitions);
  const opSchema = parseOperations(operations, defNameMap);
  return JSON.stringify({ operations: opSchema, defs: defSchema }, null, 2);
};
