import { Project } from "ts-morph";
import { getDtsNodes, parseDefinitions } from "./tsaid.js";

export const parser = () => {
  const project = new Project({});
  const args = ["./input.ts"];
  // const args = ["./cases/**/*.ts"];
  args.forEach((glob) => {
    project.addSourceFilesAtPaths(glob);
  });
  const { definitions, operations } = getDtsNodes(project);
  // const oops = path.resolve("./output/ops.json");
  // const odefs = path.resolve("./output/defs.json");
  // fs.writeFileSync(oops, "", "utf-8");
  // fs.writeFileSync(odefs, "", "utf-8");

  const { defSchema, defNameMap } = parseDefinitions(definitions);
  // const opSchema = parseOperations(operations, defNameMap);
  // fs.writeFileSync(odefs, JSON.stringify(defSchema, null, 2), "utf-8");
  // fs.writeFileSync(oops, JSON.stringify(opSchema, null, 2), "utf-8");
  // console.log("🚀 success!");
  return JSON.stringify(defSchema, null, 2);
};
