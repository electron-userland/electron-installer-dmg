import type appdmgType from 'appdmg';
import debugCreator from 'debug';
import { existsSync, promises as fs } from 'fs';
import * as path from 'path';

const debug = debugCreator('electron-installer-dmg');

export type ElectronInstallerDMGOptions = {
  /**
   * The `.app` directory generated by Electron Packager.
   */
  appPath: string;
  /**
   * The application name.
   */
  name: string;
  /**
   * The title of the produced DMG, which will be shown when mounted.
   *
   * @defaultValue the {@link ElectronInstallerDMGOptions.name | application name}
   */
  title?: string;
  /**
   * Path to the background image for the DMG window. Image should be of size 658x498.
   *
   * If you need to want to add a second Retina-compatible size, add a separate `@2x` image.
   * For example, if your image is called `background.png`, create a `background@2x.png` that is
   * double the size.
   */
  background?: string;
  /**
   * Path to the icon to use for the app in the DMG window.
   */
  icon?: string;
  /**
   * How big to make the icon for the app in the DMG.
   *
   * @defaultValue 80
   */
  iconSize?: number;
  /**
   * Overwrite an existing DMG file if if already exists.
   */
  overwrite?: boolean;
  /**
   * The content that will appear in the window when user opens the `.dmg` file.
   *
   * @defaultValue An array of two icons: the application and the `/Applications` destination folder.
   */
  contents?:
    | appdmgType.SpecificationContents[]
    | ((
        opts: ElectronInstallerDMGOptions
      ) => appdmgType.SpecificationContents[]);
  /**
   * Disk image format.
   *
   * Must be one of the following:
   *  - `UDRW` -> read/write image
   *  - `UDRO` -> read-only image
   *  - `UDCO` -> ADC-compressed image
   *  - `UDZO` -> zlib-compressed image
   *  - `UDBZ` -> bzip2-compressed image
   *  - `ULFO` -> lzfse-compressed image (macOS 10.11+ only)
   *
   * @defaultValue `UDZO`
   */
  format?: 'UDRW' | 'UDRO' | 'UDCO' | 'UDZO' | 'UDBZ' | 'ULFO';
  /**
   * Additional options to pass through to [`appdmg`](https://npm.im/appdmg)
   *
   * You can use this to set additional features like `background-color` and
   * `code-sign`.  See the docs of the `appdmg` module for all possible options.
   */
  additionalDMGOptions?: Omit<
    appdmgType.Specification,
    'title' | 'contents' | 'icon' | 'icon-size' | 'background' | 'format'
  >;
} & (
  | {
      /**
       * The directory to put the DMG into. This option cannot be specified at the same time as `dmgPath`.
       *
       * Defaults to `process.cwd()`.
       */
      out?: string;
    }
  | {
      /**
       * The full path to write the DMG to. This option cannot be specified at the same time as `out`.
       */
      dmgPath: string;
    }
);

async function build(spec: appdmgType.Specification, dmgPath: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const appdmg: typeof appdmgType = require('appdmg');

  debug('DMG spec is:\n', spec);

  debug('creating dmg...');
  return await new Promise<void>((resolve, reject) => {
    appdmg({
      basepath: process.cwd(),
      target: dmgPath,
      specification: spec,
    }).on('progress', (info) => {
      if (info.type === 'step-begin') {
        debug('appdmg [%d/%d]: %s...', info.current, info.total, info.title);
      }
    }).on('finish', async () => {
      debug('appdmg finished!');
      resolve();
    }).on('error', (err) => {
      debug('appdmg errored!', err);
      reject(err);
    });
  });
}

export const createDMG = async (opts: Readonly<ElectronInstallerDMGOptions>) => {
  const defaultSpecContents: appdmgType.SpecificationContents[] = [
    {
      x: 448,
      y: 344,
      type: 'link',
      path: '/Applications',
    },
    {
      x: 192,
      y: 344,
      type: 'file',
      path: path.resolve(process.cwd(), opts.appPath),
    },
  ];
  const specContents = opts.contents ? (
    typeof opts.contents === 'function' ? opts.contents(opts) : opts.contents
  ) : defaultSpecContents;
  const spec: appdmgType.Specification = {
    title: opts.title || opts.name,
    format: opts.format || 'UDZO',
    contents: specContents,
    ...opts.additionalDMGOptions,
  };

  if (process.platform !== 'darwin') {
    throw new Error('Must be run on OSX');
  }

  if (!opts.background) {
    spec.background = path.resolve(__dirname, '../resources/mac/background.png');
  } else {
    spec.background = path.resolve(opts.background);
  }

  if (!opts.icon) {
    spec.icon = path.resolve(__dirname, '../resources/mac/electron.icns');
  } else {
    spec.icon = path.resolve(opts.icon);
  }

  spec['icon-size'] = opts.iconSize || 80;

  if (!opts.appPath || typeof opts.appPath !== 'string') {
    throw new Error('opts.appPath must be defined as a string');
  }

  let dmgPath: string;

  let configuredOut = 'out' in opts ? opts.out : undefined;
  if (!configuredOut && !('dmgPath' in opts)) {
    configuredOut = process.cwd();
  }

  if ('out' in opts && 'dmgPath' in opts) {
    throw new Error('Only one of opts.dmgPath or opts.out must be defined as a string');
  } else if (configuredOut) {
    if (typeof configuredOut !== 'string') {
      throw new Error(`Expected opts.out to be a string but it was "${typeof configuredOut}"`);
    }

    dmgPath = path.resolve(configuredOut, `${opts.name}.dmg`);
  } else if ('dmgPath' in opts) {
    if (typeof opts.dmgPath !== 'string') {
      throw new Error(`Expected opts.dmgPath to be a string but it was "${typeof opts.dmgPath}"`);
    }

    dmgPath = opts.dmgPath;
  } else {
    throw new Error('Either opts.dmgPath or opts.out must be defined as a string');
  }

  await fs.mkdir(path.dirname(dmgPath), { recursive: true });

  if (existsSync(dmgPath)) {
    if (!opts.overwrite) {
      debug('DMG already exists at `%s` and overwrite is false', dmgPath);
      const msg = `DMG already exists.  Run electron-installer-dmg again with \
\`--overwrite\` or remove the file and rerun. ${dmgPath}`;
      throw new Error(msg);
    } else {
      debug('DMG already exists at `%s`.  Removing...', dmgPath);
      await fs.unlink(dmgPath);
    }
  }

  return build(spec, dmgPath);
};
