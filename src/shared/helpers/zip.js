import path  from 'path';
import readdir from '@mrmlnc/readdir-enhanced';
import fs from 'fs';
import JSZip from 'jszip';

export default function zip(progressCallback, dir, output, includes, excludes) {
  console.log("ZIP ...", output);
  return new Promise((resolve, reject) => {
    var archive = new JSZip();
    const allFiles = [];
    readdir.stream(dir, {deep: true})
    .on('data', data => {})
    .on('file', file => {
      allFiles.push(file);
    })
    .on('error', reject)
    .on('end', () => {

      const i = allFiles.indexOf("mimetype");
      if (i >= 0) {
        allFiles.splice(i, 1);
        allFiles.unshift("mimetype");
      }
      for (const file of allFiles) {
        const isMime = file === "mimetype";
        let doZip = true;
        if (includes) {
          doZip = false;
          for (const regexp of includes) {
            if (regexp.test(file)) {
              doZip = true;
              break;
            }
          }
        }
        if (doZip && excludes) {
          for (const regexp of excludes) {
            if (regexp.test(file)) {
              doZip = false;
              break;
            }
          }
        }
        if (doZip) {
          console.log("ZIP included:", file);
          if (isMime) {
            console.log("(STORE)");
          }
          archive.file(file, fs.createReadStream(path.resolve(dir,file)), {
            compression: isMime ? "STORE" : "DEFLATE",
            compressionOptions: {
              level: isMime ? undefined : 8,
            }
          });
        } else {
          console.log("ZIP excluded:", file);
        }
      }

      console.log("ZIPPING...", output);
      archive
      .generateNodeStream({type:'nodebuffer',streamFiles:true}, (updateCallbackMetadata) => {
        if (progressCallback) {
          progressCallback(updateCallbackMetadata.percent, updateCallbackMetadata.currentFile);
        }
      })
      .pipe(fs.createWriteStream(output))
      .on('error', reject)
      .on('finish', resolve);
    });
  });
}
