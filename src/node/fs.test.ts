import { describe, it } from "@test";
import { chDir, join, listFiles } from "./fs";

chDir(join(__dirname, "..", "..", "sandbox"));

describe("fs", () => {
    describe("listFiles", () => {
        it("can filter by file extension", async () => {
            const result = (await listFiles(".", ".md"));
            result.sort();

            expect(result).toEqual([
                join("folder1", "markdown1.md"),
                join("folder2", "markdown2.md"),
                "markdown0.md",
            ]);
        });
    });
});