import { asserts, bdd } from "../deps.ts";
const { assertEquals } = asserts;
const { beforeEach, describe, it } = bdd;
import { error, ErrorResult, ok, OkResult } from "./result.ts";
import { Equal, Expect } from "./tests.ts";

type _tests = [
	Expect<Equal<OkResult<number>["ok"], true>>,

	Expect<Equal<ErrorResult<number>["ok"], false>>,
];

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

	describe("error(42)", () => {
		let result: ErrorResult<number>;

		beforeEach(() => {
			result = error(42);
		});

		it("should set ok to false", () => {
			assertEquals(result.ok, false);
		});

		it("should set error to 42", () => {
			assertEquals(result.error, 42);
		});

		it("should unwrap error", () => {
			assertEquals(result.unwrap((_) => "Not 42", (x) => x?.toString()), "42");
		});
	});
});
