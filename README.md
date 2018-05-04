# electron-installer-dmg [![travis][travis_img]][travis_url] [![npm][npm_img]][npm_url]

> Create DMG installers for your electron apps using [appdmg][appdmg].

## Installation

```
# For use in npm scripts
npm i electron-installer-dmg --save-dev

# For use from cli
npm i electron-installer-dmg -g
```

## Usage

```
Usage: electron-installer-dmg <path/to/.app> <appname>

Create DMG installers for your electron apps.

Usage:
  electron-installer-dmg ./FooBar-darwin-x64/FooBar.app FooBar

Options:
  --out=<path>         The directory to put the DMG into. [Default: `process.cwd()`].
  --icon=<path>        Path to the icon file that will be the app icon in the DMG window.
  --icon-size=<px>     How big to make the icon for the app in the DMG. [Default: `80`].
  --background=<path>  Path to a PNG image to use as the background of the DMG. [Size: 658 x 498]
  --background-color=<color>  Background color (accepts css colors).
  --debug              Enable debug messages.
  --overwrite          Overwrite any existing DMG.
  --window.size.width=<integer> Sets window width
  --window.size.height=<integer> Sets window height
  --window.position.x=<integer> Sets window position's x coordinate
  --window.position.y=<integer> Sets window position's y coordinate
  -h --help            Show this screen.
  --version            Show version.

```

### API

```javascript
var createDMG = require('electron-installer-dmg')
createDMG(opts, function done (err) { })
```
#### createDMG(opts, callback)

##### opts
**Required**
`appPath` - *String*
The `.app` directory generated by [electron-packager][electron-packager].

`name` - *String*
The application name.

**Optional**

`background` - *String*
Path to the background for the DMG window. Background image should be of size 658 × 498.

`background-color` - *String*
Background color (accepts css colors)

`icon` - *String*
Path to the icon to use for the app in the DMG window.

`overwrite` - *Boolean*
Overwrite an existing DMG file if if already exists.

`debug` - *Boolean*
Enable debug message output.

`out` - *String*
The directory to put the DMG into. [Default: `process.cwd()`].

`icon-size` - *Number*
How big to make the icon for the app in the DMG. [Default: `80`].

`contents` - *Array* or *Function* that returns an Array of objects.
The content that will appear in the window when user opens the `.dmg` file.
[Default: Array of two icons, application and application destination folder].
Array Example:
```
[ { x: 448, y: 344, type: 'link', path: '/Applications'},
  { x: 192, y: 344, type: 'file', path: '/path/to/application.app'} ]
```
Function Example (more flexible for getting useful options used in creating dmg):
```
function (opts) {
   return [ { x: 448, y: 344, type: 'link', path: '/Applications'},
            { x: 192, y: 344, type: 'file', path: opts.appPath} ];
}
```

`format` - *String*
Disk image format. [Default: `UDZO`].

[Must be one of the following][spec]:

- `UDRW` :arrow_right: read/write image
- `UDRO` :arrow_right: read-only image
- `UDCO` :arrow_right: ADC-compressed image
- `UDZO` :arrow_right: zlib-compressed image
- `UDBZ` :arrow_right: bzip2-compressed image
- `ULFO` :arrow_right: lzfse-compressed image (macOS 10.11+ only)


##### callback

`err` - *Error*
Contains errors if any.

## License

Apache 2.0

[travis_img]: https://img.shields.io/travis/mongodb-js/electron-installer-dmg.svg
[travis_url]: https://travis-ci.org/mongodb-js/electron-installer-dmg
[npm_img]: https://img.shields.io/npm/v/electron-installer-dmg.svg
[npm_url]: https://npmjs.org/package/electron-installer-dmg
[electron-packager]: https://github.com/maxogden/electron-packager
[appdmg]: https://github.com/LinusU/node-appdmg
[spec]: https://github.com/LinusU/node-appdmg#specification
