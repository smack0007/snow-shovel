interface ResultMethods<T, E> {
	unwrap<U, F>(
		ok: (value: T) => U,
		error?: (error?: E) => F,
	): U | F;
}

export type OkResult<T> = { ok: true; value: T } & ResultMethods<T, never>;
export type ErrorResult<E> = { ok: false; error?: E } & ResultMethods<never, E>;

export type Result<T, E = unknown> =
	| OkResult<T>
	| ErrorResult<E>;

export class ResultError<E> extends Error {
	constructor(
		message: string,
		public readonly error?: E,
	) {
		super(message);
	}
}

function throwError<E>(message: string, error?: E): never {
	throw new ResultError(message, error);
}

function unwrap<T, E extends Error, U, F>(
	this: Result<T, E>,
	ok: (value: T) => U,
	error?: (error?: E) => F,
): U | F {
	return this.ok ? ok(this.value) : (error ? error(this.error) : throwError("Failed to unwrap result.", this.error));
}

export function ok<T>(data: T): OkResult<T> {
	return {
		ok: true,
		value: data,
		unwrap: unwrap as ResultMethods<T, never>["unwrap"],
	};
}

export function error<E>(error?: E): ErrorResult<E> {
	return {
		ok: false,
		error,
		unwrap: unwrap as ResultMethods<never, E>["unwrap"],
	};
}
