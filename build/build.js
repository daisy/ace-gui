'use strict'

const chalk = require('chalk');
const path = require('path');
const puppeteer = require('puppeteer');
const ProgressBar = require('progress');

(async () => {
  try {
    switch(process.env.BUILD_TARGET) {
      case 'clean':
        clean();
        break;
      case 'fetch-chromium':
        await fetchChromium();
        break;
      default:
        build();
    }
  } catch (error) {
    //TODO better error log
    console.log(error);
    process.exit();
  }
  
  function clean() {
    console.log(`${chalk.bgGreen.black(' DONE ')}${chalk.green(' Cleaned build directories.')}\n`);
    process.exit();
  }
  
  async function fetchChromium() {
    const platformList = [
      'mac',
      // 'linux',
      'win64'
    ]
    for (const platform of platformList) {
      const revision = require(`puppeteer/package.json`).puppeteer.chromium_revision;
      const fetcher = puppeteer.createBrowserFetcher({
        platform: platform
      })
      var progressBar;
      var lastDownloadedBytes = 0;
      await fetcher.download(revision, (bytes, total) => {
        if (!progressBar) {
          progressBar = new ProgressBar(`  :bar :percent / :bytes Mb`, {
            complete: `${chalk.green('\u25A0')}`,
            incomplete: '\u25A0',
            width: 50,
            total: total,
          });
          progressBar.interrupt(`Downloading Chromium for ${platform} v${revision} (${toMegabytes(total)} Mb):`)
        }
        const delta = bytes - lastDownloadedBytes;
        lastDownloadedBytes = bytes;
        progressBar.tick(delta, {bytes: toMegabytes(bytes)});
      });
      progressBar = undefined;
    }
    console.log(`${chalk.bgGreen.black(' DONE ')}${chalk.green(' Downloaded Chromium.')}\n`);
    process.exit();
  }
})();

function toMegabytes(bytes) {
  const mb = bytes / 1024 / 1024;
  return `${Math.round(mb * 10) / 10}`;
  // return bytes
}

