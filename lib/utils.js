const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const shelljs = require('shelljs');
const StreamZip = require('node-stream-zip');
const XLSX = require('xlsx');

function base64Encode(srcPath, destPath) {
  return new Promise((resolve, reject) => {
    shelljs.exec(`base64 ${srcPath} > ${destPath}`, { async: true }, (code, stdout, stderr) => {
      if (code === 0) {
        resolve();
      } else {
        reject(stderr);
      }
    });
  });
}

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    fetch(url)
      .then((res) => {
        file.on('error', (err) => reject(err));
        file.on('finish', () => resolve());
        res.body.pipe(file);
      })
      .catch((err) => reject(err));
  });
}

function parseSpreadsheet(filePath, sheetOptions) {
  return new Promise((resolve) => {
    const workbook = XLSX.readFile(filePath);
    /// for now, just take the first sheet
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, sheetOptions);
    resolve({ rows });
  });
}

function unzip(filePath, tmpDir) {
  return new Promise((resolve, reject) => {
    const zip = new StreamZip({ file: filePath });
    zip.on('error', (err) => reject(err));
    zip.on('ready', () => {
      /// unzip the first file...
      for (const entry of Object.values(zip.entries())) {
        const destPath = path.resolve(tmpDir.name, entry.name);
        zip.extract(entry.name, destPath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(destPath);
          }
          zip.close();
        });
        break;
      }
    });
  });
}

module.exports = {
  base64Encode,
  download,
  parseSpreadsheet,
  unzip,
};
