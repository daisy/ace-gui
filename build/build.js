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
    console.log(`${chalk.bgRed.white(' ERROR ')} ${error}\n`);
    process.exit();
  }
  
  function clean() {
    console.log(`${chalk.bgYellow.black(' TODO ')}${chalk.white(' implement clean task.')}\n`);
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
      await fetcher.download(revision, (downloadedBytes, totalBytes) => {
        if (!progressBar) {
          progressBar = new ProgressBar(`  \u2772:bar\u2773 :percent | :bytes Mb`, {
            complete: `${chalk.green('\u25AC')}`,
            incomplete: '\u25AC',
            width: 50,
            total: totalBytes,
          });
          progressBar.interrupt(`Downloading Chromium for ${platform} v${revision} (${toMegabytes(totalBytes)} Mb):`)
        }
        const delta = downloadedBytes - lastDownloadedBytes;
        lastDownloadedBytes = downloadedBytes;
        progressBar.tick(delta, {bytes: toMegabytes(downloadedBytes)});
      });
      progressBar = undefined;
    }
    console.log(`${chalk.bgGreen.black(' DONE ')}${chalk.green(' Downloaded Chromium.')}\n`);
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

