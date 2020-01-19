import fs from 'fs-extra'
import normalize from 'normalize-path'
import os from 'os'
import path from 'path'
import nanoid from 'nanoid'

import execGitBase from '../lib/execGit'
import { cleanUntrackedFiles } from '../lib/gitWorkflow'

jest.unmock('execa')

jest.setTimeout(20000)

const isAppveyor = !!process.env.APPVEYOR
const osTmpDir = isAppveyor ? 'C:\\projects' : fs.realpathSync(os.tmpdir())

/**
 * Create temporary directory and return its path
 * @returns {Promise<String>}
 */
const createTempDir = async () => {
  const dirname = path.resolve(osTmpDir, 'lint-staged-test', nanoid())
  await fs.ensureDir(dirname)
  return dirname
}

/**
 * Remove temporary directory
 * @param {String} dirname
 * @returns {Promise<Void>}
 */
const removeTempDir = async dirname => {
  await fs.remove(dirname)
}

let tmpDir, cwd

/** Append to file, creating if it doesn't exist */
const appendFile = async (filename, content, dir = cwd) =>
  fs.appendFile(path.resolve(dir, filename), content)

/** Wrap execGit to always pass `gitOps` */
const execGit = async args => execGitBase(args, { cwd })

/** Initialize git repo for test */
const initGitRepo = async () => {
  await execGit('init')
  await execGit(['config', 'user.name', '"test"'])
  await execGit(['config', 'user.email', '"test@test.com"'])
  await appendFile('README.md', '# Test\n')
  await execGit(['add', 'README.md'])
  await execGit(['commit', '-m initial commit'])
}

describe('gitWorkflow', () => {
  beforeEach(async () => {
    tmpDir = await createTempDir()
    cwd = normalize(tmpDir)
    await initGitRepo()
  })

  afterEach(async () => {
    if (!isAppveyor) {
      await removeTempDir(tmpDir)
    }
  })

  describe('cleanUntrackedFiles', () => {
    it('should delete untracked, unstaged files', async () => {
      const testFile = path.resolve(cwd, 'test.js')
      await appendFile(testFile, 'test')
      expect(await fs.exists(testFile)).toEqual(true)
      await cleanUntrackedFiles(execGit)
      expect(await fs.exists(testFile)).toEqual(false)
    })
  })
})
