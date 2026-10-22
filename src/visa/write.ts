import type { PassportFile } from './types';

export type WriteFile = (path: string, contents: string) => Promise<void>;

export const passportFilePath = (outDir: string, file: PassportFile) => `${outDir}/${file.passport.toLowerCase()}.json`;

export const writePassportFiles = async (files: readonly PassportFile[], outDir: string, writeFile: WriteFile): Promise<void> => {
  for (const file of files) {
    await writeFile(passportFilePath(outDir, file), JSON.stringify(file));
  }
};
