import appdmg = require('appdmg');

declare namespace createDMG {
  /**
   * The content that will appear in the window when the user opens the .dmg file.
   */
  interface Content {
    path: string;
    type: 'link' | 'file';
    x: number;
    y: number;
  }

  interface DMGOptions {
    /**
     * Additional options to pass through to [`appdmg`](https://npm.im/appdmg).
     * You can use this to set additional features like `background-color` and `code-sign`.
     * See the docs of the `appdmg` module for all possible options.
     */
    additionalDMGOptions?: Partial<appdmg.Specification>;
    /**
     * The `.app` directory generated by
     * [electron-packager](https://github.com/electron/electron-packager).
     */
    appPath: string;
    /** Path to the background for the DMG window. Background image should be of size 658×498. */
    background?: string;
    /**
     * The content that will appear in the window when user opens the .dmg file.
     * [Default: Array of two icons, application and application destination folder].
     */
    contents?: Content[] | ((opts?: DMGOptions) => Content[]);
    /** Enable debug message output. */
    debug?: boolean;
    /** Disk image format. [Default: `UDZO`]. */
    format?: 'UDRW' | 'UDRO' | 'UDCO' | 'UDZO' | 'UDBZ' | 'ULFO';
    /** Path to the icon to use for the app in the DMG window. */
    icon?: string;
    /** How big to make the icon for the app in the DMG. [Default: `80`]. */
    iconSize?: number;
    /** The application name. */
    name: string;
    /** The directory to put the DMG into. [Default: `process.cwd()`]. */
    out?: string;
    /** Overwrite an existing DMG file if if already exists. */
    overwrite?: boolean;
    /** The title of the produced DMG, which will be shown when mounted. */
    title?: string;
  }
}

/**
 * Generate a DMG for a bundled & customized Electron app.
 */
declare function createDMG(createOptions: createDMG.DMGOptions): Promise<createDMG.DMGOptions>;

export = createDMG;
