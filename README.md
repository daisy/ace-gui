<img src="./src/renderer/assets/logo.svg" alt="" width="150" align="left"/>

# Ace By DAISY App

Ace by DAISY App is the official graphical user interface for the EPUB accessibility checker developed by the [DAISY Consortium](http://daisy.org). The Ace App is available for the Windows, MacOS and Linux desktop operating systems.

<br/>
<br/>

## Latest Version

The latest version of Ace App is `v1.3.5`. Please visit the [release page](https://github.com/daisy/ace-gui/releases/tag/v1.3.5) for more information.

The Ace App currently features a software update notification system. Future versions may support a more sophisticated auto-update mechanism. Until then, users are prompted to download and install the latest release manually.

## Installation

* **MacOS** (Intel x64): download the [DMG file](https://github.com/daisy/ace-gui/releases/download/v1.3.5/Ace.by.DAISY-1.3.5.dmg), open it, and drag the `Ace by DAISY.app` file into your Applications folder.
* **MacOS** (Apple Silicon arm64 M1/M2/M3/M4): download the [DMG file](https://github.com/daisy/ace-gui/releases/download/v1.3.5/Ace.by.DAISY-1.3.5-arm64.dmg), open it, and drag the `Ace by DAISY.app` file into your Applications folder.
* **Windows** (Intel x64): download the [NSIS installer](https://github.com/daisy/ace-gui/releases/download/v1.3.5/Ace.by.DAISY.Setup.1.3.5.exe), and follow the step-by-step instructions.
* **Linux** (Intel x64): download the [AppImage file](https://github.com/daisy/ace-gui/releases/download/v1.3.5/Ace.by.DAISY-1.3.5.AppImage), and double-click the icon to immediately start using the application. Alternatively, you may download the [Debian package](https://github.com/daisy/ace-gui/releases/download/v1.3.5/ace-gui_1.3.5_amd64.deb) to install the app via your package manager (e.g. `sudo apt install ace-gui_1.3.5_amd64.deb`).
* **Linux** (arm64): download the [AppImage file](https://github.com/daisy/ace-gui/releases/download/v1.3.5/Ace.by.DAISY-1.3.5-arm64.AppImage), and double-click the icon to immediately start using the application. Alternatively, you may download the [Debian package](https://github.com/daisy/ace-gui/releases/download/v1.3.5/ace-gui_1.3.5_arm64.deb) to install the app via your package manager (e.g. `sudo apt install ace-gui_1.3.5_arm64.deb`).

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

## Developer Workflow

Please visit [this wiki page](https://github.com/daisy/ace-gui/wiki/Developer-Workflow) for detailed developer-oriented information.

## Contributing

Please read our [code of conduct](CODE_OF_CONDUCT.md) and [contributing guidelines](CONTRIBUTING.md) for details on how to contribute to this project, and the process for submitting issues or pull requests. We’re welcoming any kind of contributions 😊, feel free to get in touch with us!

## License

This project is licensed under the MIT License - see the [license file](LICENSE.md) for details
