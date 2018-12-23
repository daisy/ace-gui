import path  from 'path';
import readdir from '@mrmlnc/readdir-enhanced';
import fs from 'fs';
import JSZip from 'jszip';

export default function zip(dir, output) {
  return new Promise((resolve, reject) => {
    var archive = new JSZip();
    readdir.stream(dir, {deep: true})
    .on('data', data => {})
    .on('file', file => {
      archive.file(file, fs.createReadStream(path.resolve(dir,file)));
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
