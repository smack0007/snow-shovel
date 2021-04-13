import { exec as _exec } from "child_process";

export function exec(command: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const childProcess = _exec(command);

        childProcess.stdout?.on("data", (data) => {
            console.info(data);
        });

        childProcess.stderr?.on("data", (data) => {
            console.error(data);
        });

        childProcess.on("close", (code) => {
            resolve(code || 0);
        });

        childProcess.on("error", (error) => {
            reject(error);
        });
    });
}