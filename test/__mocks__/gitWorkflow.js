const stub = {
  stashBackup: jest.fn().mockImplementation(() => Promise.resolve()),
  applyModifications: jest.fn().mockImplementation(() => Promise.resolve()),
  restoreOriginalState: jest.fn().mockImplementation(() => Promise.resolve()),
  dropBackup: jest.fn().mockImplementation(() => Promise.resolve())
}

module.exports = () => stub
