import { Module } from "module";
import { readFileSync } from "fs";
import { join, resolve } from "path";

const repoRootDir = resolve(join(__dirname, "..", ".."));

const tscConfig = JSON.parse(readFileSync(join(__dirname, "..", "..", "tsconfig.json"), "utf8"));
const paths: { [key: string]: string } = {};

for (const key of Object.keys(tscConfig["compilerOptions"]["paths"])) {
    let alias = key;

    if (alias.endsWith("/*")) {
        alias = alias.substring(0, key.length - 1);
    }
    
    let pathTo = tscConfig["compilerOptions"]["paths"][key][0];
    
    if (pathTo.endsWith("/*")) {
        pathTo = pathTo.substring(0, pathTo.length - 1);
    }

    paths[alias] = pathTo;
}

const defaultResolveFilename = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function(request: string, parent: any): string {    
    for (const key of Object.keys(paths)) {
        if (request.startsWith(key)) {
            request = join(repoRootDir, request.replace(key, paths[key]));
        }
    }

    return defaultResolveFilename(request, parent);
}