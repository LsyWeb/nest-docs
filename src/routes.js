const fs = require("fs");
const path = require("path");

const customSort = (a, b) => {
  const getChapterNumber = (str) => parseInt(str.match(/(\d+)/)[1], 10);

  const chapterA = getChapterNumber(a);
  const chapterB = getChapterNumber(b);

  return chapterA - chapterB;
};

const directoryPath = path.join(__dirname, "../docs");

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  const markdownFiles = files.filter((file) => path.extname(file) === ".md");

  // console.log('Markdown files in the directory:');
  //  markdownFiles.forEach(file => console.log(file));

  const sortedFiles = markdownFiles
    .filter((item) => item !== "index.md")
    .sort(customSort);

  const routes = sortedFiles.map((file) => {
    const name = file.replace(".md", "");
    const link = `/${name}`;
    return { text: name, link };
  });

  // 将排序后的数组保存为 JSON 文件
  const jsonContent = JSON.stringify(routes, null, 2);

  fs.writeFile("routes.json", jsonContent, "utf8", (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
    } else {
      console.log("JSON file has been saved.");
    }
  });
});
