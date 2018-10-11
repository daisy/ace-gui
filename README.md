# Ace, the desktop application

A desktop graphical user interface for [Ace](https://daisy.github.io/ace), the EPUB accessibility checker by the [DAISY Consortium](http://daisy.org).

## Getting started

The Ace application is distributed as a self-contained application package; there is no prerequisite to install the application.

After you download the application from the [release page](https://github.com/daisy/ace-gui/releases), please follow the instructions below:

- **on macOS**: open the disk image (`.dmg` file), then copy or drag-and-drop the application to your installation folder of choice (we recommand installing Ace to your default `/Applications` folder).
- **on Windows**: open the executable installer (`.exe`), and follow the step-by-step installation process. Ace will launch automatically after the installation; shortcuts will be created on the desktop and in the application menu.

The first time Ace launches, it may take a few seconds to render a usable user interface (this is a know issue, we’re still in beta!). Once loaded, you’ll see an invitation to open an EPUB, which can be done by pressing the "Check EPUB" button, the "Check EPUB" menu item, or by drag-and-dropping an EPUB to the main window. Once an EPUB is opened, Ace will automatically start checking it and render the report.

## Development

### Technology stack

The Ace desktop application is based on the following technologies:

- [Electron](https://electronjs.org/), an open source library to build cross-platform applications with HTML, CSS, and Javascript.
- [React](https://reactjs.org/), a component-based library fo building user interfaces.
- [Redux](https://redux.js.org/), a state-container for Javascript appllications.
- [Material UI](https://material-ui.com/), a set of React components that implement the Material Design guidelines

The application's build system is based on:
- [Webpack](https://webpack.js.org), a static module bundler for Javascript applications.
- [Electron Builder](https://www.electron.build/), a solution to package and build Electron applications with installers and updaters.

### Building

To compile and launch Ace in development mode, run:

```
yarn start
```

### Releasing

To package the application for your local environment, run:

```
yarn build
```

To package the application for macOS and Windows, and release it to GitHub, run:

```
yarn release
```

### Contributing

Please read our [code of conduct](CODE_OF_CONDUCT.md) and [contributing guidelines](CONTRIBUTIN.md) for details on how to contribute to this project, and the process for submitting issues or pull requests. We’re welcoming any kind of contributions 😊, feel free to get in touch with us!

## License

This project is licensed under the MIT License - see the [license file](LICENSE.md) for details