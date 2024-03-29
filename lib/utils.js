const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const { Readable } = require('stream');
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
        Readable.fromWeb(res.body).pipe(file);
      })
      .catch((err) => reject(err));
  });
}

function insertFileIntoFile(srcPath, destPath, pattern) {
  return new Promise((resolve, reject) => {
    const command = `sed -i -E -f - ${destPath} << EOF
s/${pattern}/\\1$(cat ${srcPath} | sed ':a;N;$!ba;s/\\//\\\\\\//g' | sed ':a;N;$!ba;s/\\n/\\\\n/g')\\3/
EOF`;
    shelljs.exec(command, { async: true, shell: '/bin/bash', silent: true }, (code, stdout, stderr) => {
      if (code === 0) {
        resolve();
      } else {
        reject(stderr);
      }
    });
  });
}

function normalizeError(error) {
  if (typeof error === 'object' && error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  // else turn this unknown thing into a string
  return new Error(JSON.stringify(error));
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

function serializeError(error) {
  const normalizedError = normalizeError(error);
  return _.omit(_.pick(normalizedError, Object.getOwnPropertyNames(normalizedError)), ['config', 'request']);
}

function unzip(filePath, tmpDir) {
  return new Promise((resolve, reject) => {
    const zip = new StreamZip({ file: filePath });
    zip.on('error', (err) => reject(err));
    zip.on('ready', () => {
      // unzip the first file...
      const entries = Object.values(zip.entries());
      if (entries.length) {
        const entry = entries[0];
        const destPath = path.resolve(tmpDir.path, entry.name);
        zip.extract(entry.name, destPath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(destPath);
          }
          zip.close();
        });
      }
    });
  });
}

module.exports = {
  base64Encode,
  download,
  insertFileIntoFile,
  normalizeError,
  parseSpreadsheet,
  serializeError,
  unzip,
};
