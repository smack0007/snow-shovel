import { assertThrows } from "https://deno.land/std@0.159.0/testing/asserts.ts";
import { asserts, bdd } from "../deps.ts";
const { assertEquals } = asserts;
const { beforeEach, describe, it } = bdd;
import { error, ErrorResult, ok, OkResult, Result } from "./result.ts";
import { Equal, Expect } from "./tests.ts";

type TypeTests = [
	Expect<Equal<OkResult<number>["isOk"], true>>,

	Expect<Equal<ErrorResult<number>["isOk"], false>>,
];

describe("Result", () => {
	describe("ok(42)", () => {
		let result: OkResult<number>;

		beforeEach(() => {
			result = ok(42);
		});

		it("should set isOk to true", () => {
			assertEquals(result.isOk, true);
		});

		it("should set isError to false", () => {
			assertEquals(result.isError, false);
		});

		it("should set result to 42", () => {
			assertEquals(result.value, 42);
		});
	});

	describe("error(42)", () => {
		let result: ErrorResult<number>;

		beforeEach(() => {
			result = error(42);
		});

		it("should set ok to false", () => {
			assertEquals(result.isOk, false);
		});

		it("should set isError to true", () => {
			assertEquals(result.isError, true);
		});

		it("should set error to 42", () => {
			assertEquals(result.error, 42);
		});
	});

	describe("and", () => {
		it("should take other if isOk is true", () => {
			const result1 = ok(42);
			const result2 = ok(12);

			assertEquals(result1.and(result2), result2);

			const result3 = ok(42);
			const result4 = error(12);

			assertEquals(result3.and(result4), result4);
		});

		it("should take self if isOk is false", () => {
			const result1 = error(42);
			const result2 = ok(12);

			assertEquals(result1.and(result2), result1);

			const result3 = error(42);
			const result4 = error(12);

			assertEquals(result3.and(result4), result3);
		});
	});

	describe("isOkAnd", () => {
		it("should call predicate if isOk is true", () => {
			const result = ok(42);

			let predicateCalled = false;
			const isOkAndResult = result.isOkAnd((value) => {
				predicateCalled = true;
				return value >= 42;
			});

			assertEquals(predicateCalled, true);
			assertEquals(isOkAndResult, true);
		});

		it("should not call predicate if isOk is false", () => {
			const result = error(42);

			let predicateCalled = false;
			const isOkAndResult = result.isOkAnd((_) => {
				predicateCalled = true;
				return false;
			});

			assertEquals(predicateCalled, false);
			assertEquals(isOkAndResult, false);
		});
	});

	describe("isErrorAnd", () => {
		it("should call predicate if isError is true", () => {
			const result = error(42);

			let predicateCalled = false;
			const isErrorAndResult = result.isErrorAnd((value) => {
				predicateCalled = true;
				return value >= 42;
			});

			assertEquals(predicateCalled, true);
			assertEquals(isErrorAndResult, true);
		});

		it("should not call predicate if isError is false", () => {
			const result = ok(42);

			let predicateCalled = false;
			const isErrorAndResult = result.isErrorAnd((_) => {
				predicateCalled = true;
				return false;
			});

			assertEquals(predicateCalled, false);
			assertEquals(isErrorAndResult, false);
		});
	});

	describe("map", () => {
		it("should map if isOk is true", () => {
			const result = ok(42);
			const result2 = result.map((x) => x.toString());

			assertEquals(result2.isOk, true);
			assertEquals(result2.unwrap(), "42");
		});

		it("should not map if isOk is false", () => {
			const result = error(42);
			const result2 = result.map((x) => (x as Result<number, number>).toString());

			assertEquals(result2.isOk, false);
			assertThrows(() => {
				result2.unwrap();
			});
		});
	});

	describe("mapError", () => {
		it("should map if isOk is false", () => {
			const result = error(42);
			const result2 = result.mapError((x) => x.toString());

			assertEquals(result2.isOk, false);
			assertEquals(result2.unwrapError(), "42");
		});

		it("should not map if isOk is true", () => {
			const result = ok(42);
			const result2 = result.mapError((x) => (x as Result<number, number>).toString());

			assertEquals(result2.isOk, true);
			assertThrows(() => {
				result2.unwrapError();
			});
		});
	});

	describe("or", () => {
		it("should take self if isOk is true", () => {
			const result1 = ok(42);
			const result2 = ok(12);

			assertEquals(result1.or(result2), result1);

			const result3 = ok(42);
			const result4 = error(12);

			assertEquals(result3.or(result4), result3);
		});

		it("should take other if isOk is false", () => {
			const result1 = error(42);
			const result2 = ok(12);

			assertEquals(result1.or(result2), result2);

			const result3 = error(42);
			const result4 = error(12);

			assertEquals(result3.or(result4), result4);
		});
	});

	describe("unwrap", () => {
		it("should unwrap result", () => {
			const result = ok(42);
			assertEquals(result.unwrap(), 42);
			assertEquals(result.unwrap((x) => x.toString()), "42");
		});

		it("should throw if error callback not specified", () => {
			const result = error(42);
			assertThrows(() => {
				result.unwrap((x) => x);
			});
		});

		it("should unwrap error", () => {
			const result = error(42);
			assertEquals(result.unwrap(() => "Not 42", (x) => x.toString()), "42");
		});
	});

	describe("unwrapError", () => {
		it("should unwrap error", () => {
			const result = error(42);
			assertEquals(result.unwrapError(), 42);
			assertEquals(result.unwrapError((x) => x.toString()), "42");
		});

		it("should throw if not error", () => {
			const result = ok(42);
			assertThrows(() => {
				result.unwrapError((x) => x);
			});
		});
	});

	describe("unwrapOr", () => {
		it("should unwrap result", () => {
			const result = ok(42);
			assertEquals(result.unwrapOr(12), 42);
		});

		it("should take default for error", () => {
			const result = error(42);
			assertEquals(result.unwrapOr(12), 12);
		});
	});

	describe("unwrapOrElse", () => {
		it("should unwrap result", () => {
			const result = ok(42);
			assertEquals(result.unwrapOrElse(() => 12), 42);
		});

		it("should call callback for error", () => {
			const result = error(42);
			assertEquals(result.unwrapOrElse(() => 12), 12);
		});
	});
});
