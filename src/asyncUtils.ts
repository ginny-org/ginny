export function result<T>(promise: Promise<T>): Promise<Result<T>> {
  return promise.then(
    (value) => ({ ok: true, value }),
    (error) => ({ ok: false, error })
  );
}

export type Result<T> = ResultOk<T> | ResultError;

interface ResultOk<T> {
  ok: true;
  value: T;
}

interface ResultError {
  ok: false;
  error: any;
}

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
