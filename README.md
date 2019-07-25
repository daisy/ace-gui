<img src="./src/renderer/assets/logo.svg" alt="" width="150" align="left"/>

# Ace By DAISY App

Ace by DAISY App is the official graphical user interface for the EPUB accessibility checker developed by the [DAISY Consortium](http://daisy.org). The Ace App is available for the Windows, MacOS and Linux desktop operating systems.

<br/>
<br/>

## Latest Version

The most recent version of Ace App is `v1.0.0-rc.1` (first "Release Candidate"). Please visit the [release page](https://github.com/daisy/ace-gui/releases/tag/v1.0.0-rc.1) for more information.

The Ace App currently features a software update notification system. Future versions may support a more sophisticated auto-update mechanism. Until then, users are prompted to download and install the latest release manually.

## Installation

* **MacOS**: download the [DMG file](https://github.com/daisy/ace-gui/releases/download/v1.0.0-rc.1/Ace.by.DAISY-1.0.0-rc.1.dmg), open it, and drag the `Ace by DAISY.app` file into your Applications folder.
* **Windows**: download the [NSIS installer](https://github.com/daisy/ace-gui/releases/download/v1.0.0-rc.1/Ace.by.DAISY.Setup.1.0.0-rc.1.exe), and follow the step-by-step instructions. Please ignore the security warning messages, they are due to the application [not being signed yet](https://github.com/daisy/ace-gui/issues/15).
* **Linux**: download the [AppImage file](https://github.com/daisy/ace-gui/releases/download/v1.0.0-rc.1/Ace.by.DAISY-1.0.0-rc.1.AppImage), and double-click the icon to immediately start using the application. Alternatively, you may download the [Debian package](https://github.com/daisy/ace-gui/releases/download/v1.0.0-rc.1/ace-gui_1.0.0-rc.1_amd64.deb) to install the app via your package manager (e.g. `sudo apt install ace-gui_1.0.0-rc.1_amd64.deb`).

## Notable Features

* Online/Offline integration of the [DAISY Knowledge Base](http://kb.daisy.org/publishing/docs/).
* English and French [localization](https://github.com/daisy/ace-gui/wiki/Localization).
* Latest [Ace](https://github.com/daisy/ace/releases/tag/v1.1.1) and [Axe](https://github.com/dequelabs/axe-core/blob/develop/CHANGELOG.md#331-2019-07-23) libs.
* Reduced application size (Axe now runs via Electron itself, the Puppeteer dependency has been removed)
* Signed and Notarized DMG for MacOS, using the official DAISY Code Signing Certificate (the Windows NSIS installer will be signed at a later stage).
* Software update notifications.

## Known Limitations

Please use the [issue tracker](https://github.com/daisy/ace-gui/issues) to report problems, suggest features, etc. The most notable caveats in this pre-production release are:

* User documentation: lack of step-by-step instructions, quick-start guide and in-depth tutorial
* Visual presentation: sub-optimal user interface layout and report rendering (table view needs more "responsive design")
* Accessibility: less-then-ideal support for keyboard usage, and compatibility with screen readers
* Windows: security warnings due to present lack of code signing certificate, missing permissions to access configuration folder
* Multiple, successive evaluations: the state of the report table view is not reset, drag-and-drop support is limited
* Language localization: some menu items are not translated automatically, the platform language is not taken into account when starting the app, and only English and French are currently supported

## Documentation

A quick-start guide with step-by-step instructions is available in [this wiki page](https://github.com/daisy/ace-gui/wiki/Quick-Start). More in-depth tutorials will be added at a future stage.

Documentation about the core projects (command line, HTTP interface, etc.) is available at the [Ace support website](https://daisy.github.io/ace). The [Inclusive Publishing](https://inclusivepublishing.org/toolbox/accessibility-checker/) hub also provides useful guidance.

## Development Plan

The Ace App is under active development. The short-term plan is to iron-out bugs, improve the responsiveness and accessibility of the user interface, write documentation and tutorials, and provide additional language packs.

## Language localizations

Please visit [this wiki page](https://github.com/daisy/ace-gui/wiki/Localization) to learn about user interface translations.

## Target Audience, Design Goals

The "Ace by DAISY" [command line tool](https://daisy.github.io/ace) is designed for technical users, who are comfortable dealing with shell commands and low-level filesystem access. On the other hand, the Ace App aims to simplify usage of the accessibility evaluator by providing a familiar graphical user interface. This includes: file drag and drop, structured menus, user preferences, interactive display of the evaluation results (search, filter, sort), integration with the [DAISY Knowledge Base](http://kb.daisy.org/publishing/docs/), language localizations, etc.

Under the hood, the Ace App is powered by the same core components used by the command line tool. Although the desktop app displays the results of the accessibility evaluation in a rich, interactive user interface control (tabulated view), advanced users can export reports in the same format as those generated by the command line tool (i.e. HTML and JSON files).

The Ace App is suitable for novice users who wish to discover the functionality of the accessibility evaluator, before transitioning to more advanced command line usage (for example, in order to implement automated processing, using shell scripts).

The Ace App is not aimed at users who wish to check the accessibility of many publications in a row. This use-case is better served by the command line tool, which can be invoked multiple times in an automated manner (i.e. with minimal user interaction).

## Developer Notes

### Dependencies

The source code for the latest `ace-gui` release is [tagged](https://github.com/daisy/ace-gui/tree/v1.0.0-rc.1) as `v1.0.0-rc.1`. Under the hood, the [latest version](https://github.com/daisy/ace/releases/tag/v1.1.1) of Ace is used (`v1.1.1`). However, instead of using the official [NPM packages](https://www.npmjs.com/org/daisy), the Ace App is based on a special [code branch](https://github.com/daisy/ace/pull/229) of the core Ace project, which satisfies the technical requirements of the desktop graphical user interface. This branch includes a slightly more [up to date version](https://github.com/dequelabs/axe-core/blob/develop/CHANGELOG.md#331-2019-07-23) of Axe.

### Technologies

- [Electron](https://electronjs.org)
- [React](https://reactjs.org)
- [Redux](https://redux.js.org)
- [Material UI](https://material-ui.com)
- [Webpack](https://webpack.js.org)
- [Electron Builder](https://www.electron.build)

### Prerequisites

* [NodeJS and NPM](https://nodejs.org)
* [Yarn](https://yarnpkg.com)

### Preflight

At the moment, Ace App depends on a special branch of the Ace core project, instead of the official NPM packages (see the above [Dependencies section](#dependencies)). The following steps are therefore necessary:

* `cd MY_ACE_FOLDER` (choose your folder name / filesystem location)
* `git clone https://github.com/daisy/ace.git`
* `cd ace`
* `git checkout pr-merge/223+227` (the branch name is not meaningful, this is in fact [this Pull Request](https://github.com/daisy/ace/pull/229))
* `rm -rf node_modules && rm -rf packages/*/node_modules` (this is really only needed if `yarn install` was already invoked) 
* `rm -rf packages/*/lib` (this is really only needed if `yarn build` was already invoked)
* `rm yarn.lock` (this is necessary to reset the file paths of the local NPM dependencies)
* `yarn cache clean` (this is an optional, but strongly-recommended step, as local packages are cached too)
* `yarn install`
* `git status && git --no-pager diff` (this should show `yarn.lock` changes)
* `rm -rf node_modules/@daisy && rm -rf packages/*/node_modules/@daisy`
* `VERBOSE=1 yarn build` (this builds the source code into the local `packages/*/lib` folders)
* `yarn upgrade`
* `git status && git --no-pager diff` (this should show `yarn.lock` changes)
* `rm -rf packages/*/node_modules`
* `yarn test`
* `yarn test-cli`
* `yarn test-electron`
* `yarn test-electron-cli` (this one should fail, this is "normal")

### Build, Run, Package

* `cd MY_ACE_FOLDER` (same filesystem location as specified in the above [Preflight section](#preflight))
* `git clone https://github.com/daisy/ace-gui.git`
* `cd ace-gui`
* `git checkout master`
* `git submodule init && git submodule update` (this sets up the DAISY Knowledge Base [Git submodule](https://github.com/daisy/kb))
* `rm -rf node_modules` (this is really only needed if `yarn install` was already invoked)
* `rm yarn.lock` (this is necessary to reset the file paths of the local NPM dependencies)
* `yarn cache clean` (this is an optional, but strongly-recommended step, as local packages are cached too)
* `yarn install`
* `git status && git --no-pager diff` (this should show `yarn.lock` changes)
* `yarn clean`
* `yarn start:dev` (launches the app after compiling in development mode, with a file watcher)
* `yarn start:dev_` (launches the app after compiling in development mode, no file watcher)
* `yarn start:prod` (launches the app after compiling in production mode, no file watcher)
* `yarn start` (launches the app without compilation, so requires prior manual invokation of `yarn build:prod` or `yarn build:dev`)
* `yarn package:linux` (creates the Linux distributable Debian package and AppImage)
* `yarn package:windows` (creates the Windows NSIS installer, currently unsigned)
* `yarn package:mac` (creates the MacOS DMG installer, requires the DAISY EV Code Signing Certificate and invokes the Apple Notarization process)

## Contributing

Please read our [code of conduct](CODE_OF_CONDUCT.md) and [contributing guidelines](CONTRIBUTING.md) for details on how to contribute to this project, and the process for submitting issues or pull requests. We’re welcoming any kind of contributions 😊, feel free to get in touch with us!

## License

This project is licensed under the MIT License - see the [license file](LICENSE.md) for details
