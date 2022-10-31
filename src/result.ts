interface ResultMethods<T, E extends Error> {
  unwrap<U, F>(
    ok: (value: T) => U,
    error?: (error?: E) => F
  ): U | F;
}

type Result<T, E extends Error = Error> = 
  | ({ ok: true, value: T } & ResultMethods<T, E>)
  | ({ ok: false, error?: E } & ResultMethods<T, E>);

function throwError(error?: Error): never {
  throw error ?? new Error();
}

function unwrap<T, E extends Error, U, F>(
  this: Result<T, E>,
  ok: (value: T) => U,
  error?: (error?: E) => F
): U | F {
  return this.ok ? ok(this.value) : (error ? error(this.error) : throwError(this.error));
}

function ok<T>(data: T): Result<T, never> {
    return { ok: true, value: data, unwrap: unwrap as ResultMethods<T, any>["unwrap"] };
}
 
function error<E extends Error>(error?: E): Result<never, E> {
    return { ok: false, error, unwrap };
}
