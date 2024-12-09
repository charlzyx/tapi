import { Project } from "ts-morph";
import { parseDefinitions, parseOperations, getDtsNodes } from "@tapi/parser";

const project = new Project({});
import minimist from "minimist";

const args = minimist(process.argv.slice(2));
const inputs = args._;
const output = args.o || args.output;

if (!output || inputs.length === 0) {
  console.warn("Usage: @tapi/cli [...inputfiles] -o dist");
  process.exit(1);
}

inputs.forEach((glob) => {
  project.addSourceFilesAtPaths(glob);
});

import * as fs from "fs";
import * as path from "path";

export const parser = (project: Project) => {
  const { definitions, operations } = getDtsNodes(project);
  const opsOut = path.resolve(output, "ops.json");
  const defsOut = path.resolve(output, "defs.json");
  fs.writeFileSync(defsOut, "", "utf-8");
  fs.writeFileSync(opsOut, "", "utf-8");
  const { defSchema, defNameMap } = parseDefinitions(definitions);
  const opSchema = parseOperations(operations, defNameMap);
  fs.writeFileSync(defsOut, JSON.stringify(defSchema, null, 2), "utf-8");
  fs.writeFileSync(opsOut, JSON.stringify(opSchema, null, 2), "utf-8");
};

parser(project);
