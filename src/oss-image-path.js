const fs = require("fs");
const path = require("path");

const rootFolder = path.join(__dirname, "../docs"); // 替换为你的根文件夹路径

async function downloadAndReplaceImagesInMdFile(mdFilePath) {
  try {
    // 读取MD文件内容
    let mdContent = fs.readFileSync(mdFilePath, "utf8");
  
    mdContent = mdContent.replace(/!\[(.*?)\]\(\.\/(.*?)\)/g, '![$1](//liushuaiyang.oss-cn-shanghai.aliyuncs.com/nest-docs/$2)');

    fs.writeFileSync(mdFilePath, mdContent, "utf8");
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
  const customSort = (a, b) => {
    const getChapterNumber = (str) => parseInt(str.match(/(\d+)/)[1], 10);

    const chapterA = getChapterNumber(a);
    const chapterB = getChapterNumber(b);

    return chapterA - chapterB;
  };
  const sortedFiles = mdFiles
    .filter((item) => item !== "index.md")
    .sort(customSort);

  // 对每个MD文件进行下载和替换操作
  sortedFiles.forEach((mdFile) => {
    const mdFilePath = path.join(rootFolder, mdFile);
    downloadAndReplaceImagesInMdFile(mdFilePath);
  });
});
