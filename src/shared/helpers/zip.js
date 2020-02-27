import path  from 'path';
import readdir from '@mrmlnc/readdir-enhanced';
import fs from 'fs';
import JSZip from 'jszip';

export default function zip(dir, output, includes) {
  return new Promise((resolve, reject) => {
    var archive = new JSZip();
    readdir.stream(dir, {deep: true})
    .on('data', data => {})
    .on('file', file => {
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
      if (doZip) {
        console.log("ZIP included:", file);
        archive.file(file, fs.createReadStream(path.resolve(dir,file)));
      } else {
        console.log("ZIP excluded:", file);
      }
    })
    .on('error', reject)
    .on('end', () => {
      archive
      .generateNodeStream({type:'nodebuffer',streamFiles:true})
      .pipe(fs.createWriteStream(output))
      .on('error', reject)
      .on('finish', resolve);
    });
  });
}
