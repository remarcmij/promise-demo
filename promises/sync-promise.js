const log = createLogger(true);

export class SyncPromise {
  static #count = 0;

  #state = 'pending';
  #value = undefined;
  #id = 0;

  static resolve(value) {
    return new SyncPromise((resolve) => resolve(value));
  }

  static reject(value) {
    return new SyncPromise((resolve, reject) => reject(value));
  }

  constructor(executor) {
    // Assign a unique id to each promise
    this.#id = ++SyncPromise.#count;

    const resolve = (value) => {
      if (this.#state === 'pending') {
        this.#state = 'fulfilled';
        this.#value = value;
        log(`[promise#${this.#id} fulfilled]`);
      }
    };

    const reject = (value) => {
      if (this.#state === 'pending') {
        this.#state = 'rejected';
        this.#value = value;
        log(`[promise#${this.#id} rejected]`);
      }
    };

    executor(resolve, reject);

    if (this.#state === 'pending') {
      log(`[promise#${this.#id} pending]`);
    }
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

    // Return a new pending promise
    return new SyncPromise(() => {});
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}

function createLogger(showOutput = false) {
  return (...args) => {
    if (showOutput) {
      console.log(...args);
    }
  };
}
