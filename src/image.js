const fs = require("fs");
const path = require("path");

const axios = require("axios");

const rootFolder = path.join(__dirname, "../docs"); // 替换为你的根文件夹路径
const downloadDir = path.join(__dirname, "../docs/image"); // 替换为你想要保存图片的目录路径

async function downloadAndReplaceImagesInMdFile(mdFilePath) {
  try {
    // 读取MD文件内容
    let mdContent = fs.readFileSync(mdFilePath, "utf8");

    // 正则表达式用于匹配MD文件中的http/https图片链接
    const imgRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\)/g;

    // 获取所有匹配的图片链接
    const imgMatches = mdContent.match(imgRegex);

    // 获取MD文件的基本名称（不包含扩展名）
    const mdFileName = path.basename(mdFilePath, path.extname(mdFilePath));

    if (imgMatches) {
      // 创建下载目录（如果不存在）
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      // 遍历图片链接并下载
      for (let index = 0; index < imgMatches.length; index++) {
        const imgMatch = imgMatches[index];
        const imgSrc = imgMatch.match(/!\[.*?\]\((.*?)\)/)[1];
        const imgName =
          `${mdFileName.replace(/(\d+).*/, "$1")}-${index + 1}` +
          ".png";
        const imgPath = path.join(downloadDir, imgName);

        // 发送HTTP请求下载图片
        const response = await axios.get(imgSrc, {
          responseType: "arraybuffer",
        });
        fs.writeFileSync(imgPath, Buffer.from(response.data));
        console.log(`File: ${mdFileName} Downloaded: ${imgPath}`);

        // 更新MD文件内容，将图片链接替换为相对路径
        mdContent = mdContent.replace(imgSrc, "./image/" + imgName);
      }

      // 将更新后的MD文件内容保存回文件
      fs.writeFileSync(mdFilePath, mdContent, "utf8");
      console.log(`MD file updated with local image paths: ${mdFilePath}`);
    } else {
      console.log(`该文件夹下无image: ${mdFilePath}`);
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
