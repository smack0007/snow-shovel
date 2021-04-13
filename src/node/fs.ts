import {
    copyFile as _copyFile,
    lstatSync,
    mkdir as _mkdir,
    readdirSync,
    readFile as _readFile,
    readlinkSync,
    symlinkSync,
    writeFile as _writeFile,
} from "fs";
import { extname, join } from "path";
import { promisify } from "util";

export { dirname as dirName, join, resolve } from "path";
export { fileURLToPath } from "url";

export const readFile = promisify(_readFile);
export const writeFile = promisify(_writeFile);

export async function copyDir(src: string, dest: string): Promise<void> {
    await mkDir(dest);
    const files = readdirSync(src);
    for (const file of files) {
        const current = lstatSync(join(src, file));
        if (current.isDirectory()) {
            await copyDir(join(src, file), join(dest, file));
        } else if (current.isSymbolicLink()) {
            const symlink = readlinkSync(join(src, file));
            symlinkSync(symlink, join(dest, file));
        } else {
            await __copyFile(join(src, file), join(dest, file));
        }
    }
}

const __copyFile = promisify(_copyFile);
export async function copyFile(src: string, dest: string): Promise<void> {
    return __copyFile(src, dest);
}

export async function listFiles(path: string, ext?: string): Promise<string[]> {
    const files = [];
    for (const file of readdirSync(path)) {
        const filePath = join(path, file);
        const fileStat = lstatSync(filePath);

        if (fileStat.isDirectory()) {
            files.push(...(await listFiles(filePath, ext)));
        } else {
            if (ext !== undefined) {
                const fileExt = extname(filePath);

                if (fileExt === ext) {
                    files.push(filePath);
                }
            } else {
                files.push(filePath);
            }
        }
    }

    return files;
}

const __mkdir = promisify(_mkdir);
export async function mkDir(
    dir: string,
    recursive: boolean = true
): Promise<string | void | undefined> {
    return __mkdir(dir, { mode: 755, recursive }).catch((error) => {
        if (error.code !== "EEXIST") {
            throw error;
        }
    });
}
