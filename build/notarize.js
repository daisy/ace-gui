// xcrun notarytool history --apple-id=$APPLEID --team-id=$APPLEIDTEAM --password=$APPLEIDPASS

require('dotenv').config();
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin' || process.env.SKIP_NOTARIZE) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  return await notarize({
    appBundleId: 'org.daisy.ace',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    teamId: process.env.APPLEIDTEAM,
    ascProvider: process.env.APPLEIDTEAM
  });
};
