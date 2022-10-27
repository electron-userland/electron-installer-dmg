import * as assert from 'assert';
import { download } from '@electron/get';
import { existsSync, promises as fs } from 'fs';
import * as path from 'path';
import * as unzip from 'extract-zip';

import { createDMG } from '../';

const MINUTES_IN_MS = 60 * 1000;

const fixtureDMGPath = path.resolve(__dirname, 'fixture.dmg');

describe('electron-installer-dmg', () => {
  before(() => {
    assert.equal(process.platform, 'darwin', 'tests can only run on darwin');
  });

  it('should be requireable', () => {
    assert.doesNotThrow(() => require('..')); // eslint-disable-line global-require
  });

  describe('with app', () => {
    const appPath = path.resolve(__dirname, 'fixture', 'Electron.app');

    before(async function downloadElectron() {
      this.timeout(2 * MINUTES_IN_MS);

      const zipPath = await download('18.2.0');
      await unzip(zipPath, { dir: appPath });
    });

    it('should succeed in creating a DMG', async function testCreate() {
      this.timeout(2 * MINUTES_IN_MS);
      await createDMG({
        appPath,
        dmgPath: fixtureDMGPath,
        name: 'Test App',
      });
      assert(existsSync(fixtureDMGPath), 'dmg should exist');
    });

    afterEach(async () => existsSync(fixtureDMGPath) ? fs.unlink(fixtureDMGPath) : null);

    after(async () => fs.rmdir(appPath, { recursive: true }));
  });
});
