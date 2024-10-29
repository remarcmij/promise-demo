export class SyncPromise {
  #state = 'pending';
  #value = undefined;

  static resolve(value) {
    return new SyncPromise((resolve) => resolve(value));
  }

  static reject(value) {
    return new SyncPromise((resolve, reject) => reject(value));
  }

  constructor(executor) {
    const resolve = (value) => {
      if (this.#state === 'pending') {
        this.#state = 'fulfilled';
        this.#value = value;
      }
    };

    const reject = (value) => {
      if (this.#state === 'pending') {
        this.#state = 'rejected';
        this.#value = value;
      }
    };

    executor(resolve, reject);
  }

  then(onResolved, onRejected) {
    if (this.#state === 'fulfilled') {
      let value = this.#value;
      if (onResolved) {
        value = onResolved(value);
        if (value instanceof SyncPromise) {
          return value;
        }
      }

      return SyncPromise.resolve(value);
    }

    if (this.#state === 'rejected') {
      let value = this.#value;
      if (onRejected) {
        value = onRejected(value);
        if (value instanceof SyncPromise) {
          return value;
        }
        return SyncPromise.resolve(value);
      }

      return SyncPromise.reject(value);
    }

    throw new Error('This synchronous promise cannot be pending');
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}
