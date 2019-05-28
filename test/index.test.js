const assert = require('assert');
const { download } = require('@electron/get');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const rimraf = require('rimraf');
const zip = require('cross-zip');

const unzip = promisify(zip.unzip);

describe('electron-installer-dmg', () => {
  before(() => {
    assert.equal(process.platform, 'darwin', 'tests can only run on darwin');
  });

  it('should be requireable', () => {
    assert.doesNotThrow(() => require('../')); // eslint-disable-line global-require
  });

  describe('with app', () => {
    const appPath = path.resolve(__dirname, 'fixture');

    before(async () => {
      this.timeout(120000);

      const zipPath = await download('2.0.4');
      await unzip(zipPath, appPath);
    });

    it('should succeed in creating a DMG', async () => {
      this.timeout(30000);
      const createDMG = require('../'); // eslint-disable-line global-require
      const dmgPath = path.resolve(__dirname, 'fixture.dmg');
      await createDMG({
        appPath,
        dmgPath,
        name: 'Test App',
      });
      assert(await fs.pathExists(dmgPath), 'dmg should exist');
    });

    afterEach(() => fs.unlink(`${appPath}.dmg`));

    after(() => {
      rimraf.sync(appPath);
    });
  });
});
