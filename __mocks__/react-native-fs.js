const files = new Map();
module.exports = {
  __files: files,
  DocumentDirectoryPath: '/private',
  CachesDirectoryPath: '/private/cache',
  mkdir: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn(async path => files.has(path)),
  readFile: jest.fn(async path => {
    if (!files.has(path)) throw new Error('missing');
    return files.get(path);
  }),
  writeFile: jest.fn(async (path, content) => {
    files.set(path, content);
  }),
  unlink: jest.fn(async path => {
    files.delete(path);
  }),
};
