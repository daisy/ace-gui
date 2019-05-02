'use strict'

const chalk = require('chalk');
const path = require('path');
const ProgressBar = require('progress');

(async () => {
  try {
    switch(process.env.BUILD_TARGET) {
      case 'clean':
        clean();
        break;
      default:
        build();
    }
  } catch (error) {
    console.log(`${chalk.bgRed.white(' ERROR ')} ${error}\n`);
    process.exit();
  }
  
  function clean() {
    console.log(`${chalk.bgYellow.black(' TODO ')}${chalk.white(' implement clean task.')}\n`);
    process.exit();
  }
  
  function build() {
    console.log(`${chalk.bgYellow.black(' TODO ')}${chalk.white(' implement build task.')}\n`);
    process.exit();
  }
  
})();

function toMegabytes(bytes) {
  const mb = bytes / 1024 / 1024;
  return `${Math.round(mb * 10) / 10}`;
}

