import { describe, expect, it, vi } from 'vitest';
import { writePassportFiles } from './write';
import type { PassportFile } from './types';
import { code } from './test-fixtures';

const georgiaFile: PassportFile = { passport: code('GE'), rules: {} };
const turkeyFile: PassportFile = { passport: code('TR'), rules: {} };

describe('writePassportFiles', () => {
  it('writes each passport to a lowercase JSON file in the output folder', async () => {
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await writePassportFiles([georgiaFile, turkeyFile], 'public/visa', writeFile);

    expect(writeFile.mock.calls).toEqual([
      ['public/visa/ge.json', JSON.stringify(georgiaFile)],
      ['public/visa/tr.json', JSON.stringify(turkeyFile)],
    ]);
  });

  it('writes nothing for no files', async () => {
    const writeFile = vi.fn();

    await writePassportFiles([], 'public/visa', writeFile);

    expect(writeFile).not.toHaveBeenCalled();
  });

  it('fails when a write fails', async () => {
    const writeFile = vi.fn().mockRejectedValue(new Error('disk full'));

    await expect(writePassportFiles([georgiaFile], 'public/visa', writeFile)).rejects.toThrow('disk full');
  });
});
