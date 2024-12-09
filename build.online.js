const fs = require("fs");
const path = require("path");

/**
 * 遍历目录并生成文件描述对象
 * @param {string} dirPath - 要遍历的目录路径
 * @returns {Object} - 按照指定格式生成的文件描述对象
 */
function generateFileTree(dirPath) {
  const result = {};

  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      console.log("dir", itemPath);
      result[item.name] = {
        directory: generateFileTree(itemPath),
      };
    } else if (item.isFile()) {
      console.log("file", itemPath);
      const contents = fs.readFileSync(itemPath, "utf-8");
      result[item.name] = {
        file: {
          contents,
        },
      };
    }
  }

  return result;
}

// 示例使用
const targetDirectory = "./docs/online/srv"; // 替换为你的目标目录路径
const fileTree = generateFileTree(targetDirectory);

const files = "export const files = " + JSON.stringify(fileTree, null, 2);

fs.writeFileSync("./docs/online/files.ts", "", "utf-8");
fs.writeFileSync("./docs/online/files.ts", files, "utf-8");
