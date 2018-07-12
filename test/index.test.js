const assert = require('assert');
const electronDownload = require('electron-download');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const zip = require('cross-zip');

describe('electron-installer-dmg', () => {
  before(() => {
    assert.equal(process.platform, 'darwin', 'tests can only run on darwin');
  });

  it('should be requireable', () => {
    assert.doesNotThrow(() => require('../')); // eslint-disable-line global-require
  });

  describe('with app', () => {
    const appPath = path.resolve(__dirname, 'fixture');

    before(function downloadElectron(done) {
      this.timeout(120000);

      electronDownload({
        version: '2.0.4',
      }, (downloadErr, zipPath) => {
        if (downloadErr) return done(downloadErr);
        zip.unzip(zipPath, appPath, done);
      });
    });

    it('should succeed in creating a DMG', function testCreate() {
      this.timeout(30000);
      const createDMG = require('../'); // eslint-disable-line global-require
      const dmgPath = path.resolve(__dirname, 'fixture.dmg');
      return createDMG.p({
        appPath,
        dmgPath,
        name: 'Test App',
      }).then(() => {
        assert(fs.existsSync(dmgPath), 'dmg should exist');
      });
    });

    afterEach(() => {
      fs.unlinkSync(`${appPath}.dmg`);
    });

    after(() => {
      rimraf.sync(appPath);
    });
  });
});
