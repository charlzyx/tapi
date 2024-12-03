import { Project } from "ts-morph";
import { parser } from "@tapi/parser";

const project = new Project({});
const args = process.argv.slice(2);

args.forEach((glob) => {
  project.addSourceFilesAtPaths(glob);
});

parser(project);
