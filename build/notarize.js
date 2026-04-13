// xcrun notarytool history --apple-id=$APPLEID --team-id=$APPLEIDTEAM --password=$APPLEIDPASS

// xcrun notarytool store-credentials "ace-keychain" --apple-id $APPLEID --team-id $APPLEIDTEAM --password $APPLEIDPASS --verbose --keychain ~/Library/Keychains/login.keychain-db
// export APPLEIDKEYCHAIN="ace-keychain"

require("dotenv").config();
const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin" || process.env.SKIP_NOTARIZE) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  // https://github.com/electron/notarize/blob/main/README.md
  return await notarize(
    !!process.env.APPLEIDKEYCHAIN
      ? {
          appBundleId: "org.daisy.ace",
          appPath: `${appOutDir}/${appName}.app`,

          keychainProfile: process.env.APPLEIDKEYCHAIN,
        }
      : {
          appBundleId: "org.daisy.ace",
          appPath: `${appOutDir}/${appName}.app`,

          appleId: process.env.APPLEID,
          appleIdPassword: process.env.APPLEIDPASS,
          teamId: process.env.APPLEIDTEAM,
          ascProvider: process.env.APPLEIDTEAM, // legacy
        },
  );
};
