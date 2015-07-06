var createDMG = require('../');
var assert = require('assert');

describe('electron-installer-dmg', function() {
  it('should be requireable', function() {
    assert(createDMG);
  });
});
