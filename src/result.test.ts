import { beforeEach } from "https://deno.land/std@0.161.0/testing/bdd.ts";
import { asserts, bdd } from "../deps.ts";
const { assertEquals } = asserts;
const { describe, it } = bdd;
import { ok, OkResult } from "./result.ts";

describe("Result", () => {
	describe("ok(42)", () => {
		let result: OkResult<number>;

		beforeEach(() => {
			result = ok(42);
		});

		it("should set ok to true", () => {
			assertEquals(result.ok, true);
		});

		it("should set result to 42", () => {
			assertEquals(result.value, 42);
		});

		it("should unwrap result", () => {
			assertEquals(result.unwrap((x) => x.toString()), "42");
		});
	});
});
