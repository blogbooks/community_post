const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

// ファイルタイプの列挙体（のつもり）
const FileType = {
  File: 'file',
  Directory: 'directory',
  Unknown: 'unknown'
}

/**
 * ファイルの種類を取得する
 * @param {string} path パス
 * @return {FileType} ファイルの種類
 */
const getFileType = path => {
  try {
    const stat = fs.statSync(path);

    switch (true) {
      case stat.isFile():
        return FileType.File;

      case stat.isDirectory():
        return FileType.Directory;

      default:
        return FileType.Unknown;
    }

  } catch(e) {
    return FileType.Unknown;
  }
}

/**
 * 指定したディレクトリ配下のすべてのファイルをリストアップする
 * @param {string} dirPath 検索するディレクトリのパス
 * @return {Array<string>} ファイルのパスのリスト
 */
const listFiles = dirPath => {
  const ret = [];
  const paths = fs.readdirSync(dirPath);

  paths.forEach(a => {
    const path = `${dirPath}/${a}`;
    console.log(path);

    switch (getFileType(path)) {
      case FileType.File:
        if (!a.endsWith(".md")) break;
        ret.push(path);
        break;

      case FileType.Directory:
        ret.push(...listFiles(path));
        break;

      default:
        /* noop */
    }
  })

  return ret;
};

const dirPath = path.resolve(__dirname);
const list = listFiles(dirPath);
let mapData = [];

list.forEach(d => {
    const markdown = fs.readFileSync(d, {encoding: 'utf-8'});
    if (markdown.match(/^---[\s\S]*---/) == null) {
        
    } else {
        const meta = yaml.load(markdown.match(/^---[\s\S]*?---/)[0].substring(3, markdown.match(/^---[\s\S]*?---/)[0].length - 3));
        mapData.push({"path": d, "title": meta.title, "timestamp": meta.timestamp, "description": meta.description});
    }
})

fs.writeFileSync("../.contents", Buffer.from(mapData).toString("hex"));
