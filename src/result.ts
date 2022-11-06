type Predicate<T> = (value: T) => boolean;

export interface Result<T, E> {
	readonly isOk: boolean;
	readonly isError: boolean;

	readonly value: T;
	readonly error: E;

	and(other: Result<T, E>): Result<T, E>;

	andThen<U, F>(op: (value: T) => Result<U, F>): Result<T | U, E | F>;

	isOkAnd(predicate: Predicate<T>): boolean;

	isErrorAnd(predicate: Predicate<E>): boolean;

	map<U>(callback: (value: T) => U): Result<U, E>;

	mapError<F>(callback: (error: E) => F): Result<T, F>;

	or(other: Result<T, E>): Result<T, E>;

	unwrap(): T;
	unwrap<U>(ok: (value: T) => U): U;
	unwrap<U, F>(ok: (value: T) => U, error: (error: E) => F): U | F;

	unwrapError(): E;
	unwrapError<F>(error: (error: E) => F): F;

	unwrapOr(defaultValue: T): T;

	unwrapOrElse(op: () => T): T;
}

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

const methods = {
	and: function <T, E>(
		this: Result<T, E>,
		other: Result<T, E>,
	): Result<T, E> {
		return this.isOk ? other : this;
	},

	andThen: function <T, U, E, F>(
		this: Result<T, E>,
		op: (value: T) => Result<U, F>,
	): Result<T | U, E | F> {
		return this.isOk ? op(this.value) : this;
	},

	isOkAnd: function <T, E>(
		this: Result<T, E>,
		predicate: Predicate<T>,
	): boolean {
		return this.isOk && predicate(this.value);
	},

	isErrorAnd: function <T, E>(
		this: Result<T, E>,
		predicate: Predicate<E>,
	): boolean {
		return this.isError && predicate(this.error);
	},

	map: function <T, E, U>(
		this: Result<T, E>,
		callback: (value: T) => U,
	): Result<U, E> {
		return this.isOk ? ok(callback(this.value)) as Result<U, E> : this as unknown as Result<U, E>;
	},

	mapError: function <T, E, F>(
		this: Result<T, E>,
		callback: (value: E) => F,
	): Result<T, F> {
		return this.isError ? error(callback(this.error)) : this as unknown as Result<T, F>;
	},

	or: function <T, E>(
		this: Result<T, E>,
		other: Result<T, E>,
	): Result<T, E> {
		return this.isOk ? this : other;
	},

	unwrap: function <T, E, U, F>(
		this: Result<T, E>,
		ok?: (value: T) => U,
		error?: (error: E) => F,
	): T | U | F {
		return this.isOk
			? (ok ? ok(this.value) : this.value)
			: (error ? error(this.error) : throwError("Failed to unwrap value.", this.error));
	},

	unwrapError: function <T, E, F>(
		this: Result<T, E>,
		error?: (error: E) => F,
	): E | F {
		return this.isError ? (error ? error(this.error) : this.error) : throwError("Failed to unwrap error.", this.value);
	},

	unwrapOr: function <T, E>(
		this: Result<T, E>,
		defaultValue: T,
	): T {
		return this.isOk ? this.value : defaultValue;
	},

	unwrapOrElse: function <T, E>(
		this: Result<T, E>,
		callback: () => T,
	): T {
		return this.isOk ? this.value : callback();
	},
};

const properties: PropertyDescriptorMap = {
	isError: {
		get: function (this: Result<unknown, unknown>): boolean {
			return !this.isOk;
		},
	},
};

export function ok<T>(value: T): Result<T, never> {
	return Object.create({
		isOk: true,
		value,
		...methods,
	}, properties);
}

export function error<E>(error: E): Result<never, E> {
	return Object.create({
		isOk: false,
		error,
		...methods,
	}, properties);
}
