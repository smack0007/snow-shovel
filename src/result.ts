interface ResultMethods<T, E extends Error> {
	unwrap<U, F>(
		ok: (value: T) => U,
		error?: (error?: E) => F,
	): U | F;
}

export type OkResult<T> = { ok: true; value: T } & ResultMethods<T, never>;
export type ErrorResult<E extends Error> = { ok: false; error?: E } & ResultMethods<never, E>;

export type Result<T, E extends Error = Error> =
	| OkResult<T>
	| ErrorResult<E>;

function throwError(error?: Error): never {
	throw error ?? new Error();
}

function unwrap<T, E extends Error, U, F>(
	this: Result<T, E>,
	ok: (value: T) => U,
	error?: (error?: E) => F,
): U | F {
	return this.ok ? ok(this.value) : (error ? error(this.error) : throwError(this.error));
}

export function ok<T>(data: T): OkResult<T> {
	return { ok: true, value: data, unwrap: unwrap as ResultMethods<T, any>["unwrap"] };
}

export function error<E extends Error>(error?: E): ErrorResult<E> {
	return { ok: false, error, unwrap };
}
