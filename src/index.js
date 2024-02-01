const fs = require("fs");
const path = require("path");

const rootFolder = path.join(__dirname, "../docs"); // 替换为你的根文件夹路径

function addHeaderIfEmpty(mdFilePath) {
  try {
    // 读取MD文件内容
    let mdContent = fs.readFileSync(mdFilePath, "utf8");
    const mdFileName = path.basename(mdFilePath, path.extname(mdFilePath));
    // 如果文件内容为空，则添加头部
    if (mdContent.trim() === `#${mdFileName}`) {
      mdContent = `# ${mdFileName}\n 暂未写作`;
      fs.writeFileSync(mdFilePath, mdContent, "utf8");
      console.log(`Header added to empty MD file: ${mdFilePath}`);
    } else {
      console.log(`MD file is not empty: ${mdFilePath}`);
    }
  } catch (error) {
    console.error(`Error processing MD file: ${mdFilePath}`, error);
  }
}

// 遍历根文件夹，找到所有MD文件并处理
fs.readdir(rootFolder, (err, files) => {
  if (err) {
    console.error("Error reading root folder:", err);
    return;
  }

  // 筛选出所有的MD文件
  const mdFiles = files.filter((file) => path.extname(file) === ".md");

  // 对每个MD文件进行添加头部操作
  mdFiles.forEach((mdFile) => {
    const mdFilePath = path.join(rootFolder, mdFile);
    addHeaderIfEmpty(mdFilePath);
  });
});
