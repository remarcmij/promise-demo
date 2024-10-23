// Adapted from: https://medium.com/swlh/implement-a-simple-promise-in-javascript-20c9705f197a

// check for promise or promise-like result
const isThenable = (result) =>
  ['object', 'function'].includes(typeof result) &&
  typeof result.then === 'function';

export class AsyncPromise {
  static resolve(value) {
    return new AsyncPromise((resolve, reject) => resolve(value));
  }

  static reject(value) {
    return new AsyncPromise((resolve, reject) => reject(value));
  }

  // Promise.all() adapted from https://medium.com/@copperwall/implementing-promise-all-575a07db509a
  static all(promises) {
    return new Promise((resolve, reject) => {
      let results = [];
      let completed = 0;

      promises.forEach((promise, index) => {
        Promise.resolve(promise)
          .then((result) => {
            results[index] = result;
            completed += 1;

            if (completed == promises.length) {
              resolve(results);
            }
          })
          .catch((err) => reject(err));
      });
    });
  }

  static #count = 0;

  #state = 'pending';
  #value = undefined;
  #reason = undefined;
  #rejectedHandlers = [];
  #fulfilledHandlers = [];
  #id = 0;

  constructor(executor) {
    // Assign a unique id to each promise
    this.#id = ++AsyncPromise.#count;

    const resolve = (value) => {
      if (this.#state === 'pending') {
        this.#state = 'fulfilled';
        this.#value = value;
        this.#fulfilledHandlers.forEach((handler) => handler());
      }
    };

    const reject = (reason) => {
      if (this.#state === 'pending') {
        this.#state = 'rejected';
        this.#reason = reason;
        this.#rejectedHandlers.forEach((handler) => handler());
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }

    console.log(`[promise #${this.#id} ${this.#state}]`);
  }

  #fulfilledHandler(resolve, reject, onFulfilled) {
    queueMicrotask(() => {
      console.log(`\n[microtask #${this.#id} start]`);

      try {
        if (typeof onFulfilled === 'function') {
          const result = onFulfilled(this.#value);
          if (isThenable(result)) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } else {
          resolve(this.#value);
        }
      } catch (err) {
        reject(err);
      }

      console.log(`[microtask #${this.#id} exit]`);
    });
  }

  #rejectedHandler(resolve, reject, onRejected) {
    queueMicrotask(() => {
      console.log(`\n[microtask #${this.#id} start]`);
      try {
        if (typeof onRejected === 'function') {
          const result = onRejected(this.#reason);
          if (isThenable(result)) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } else {
          reject(this.#reason);
        }
      } catch (err) {
        reject(err);
      }

      console.log(`[microtask #${this.#id} exit]`);
    });
  }

  then(onFulfilled, onRejected) {
    return new AsyncPromise((resolve, reject) => {
      if (this.#state === 'fulfilled') {
        this.#fulfilledHandler(resolve, reject, onFulfilled);
      } else if (this.#state === 'rejected') {
        this.#rejectedHandler(resolve, reject, onRejected);
      } else {
        // pending
        this.#fulfilledHandlers.push(() =>
          this.#fulfilledHandler(resolve, reject, onFulfilled)
        );
        this.#rejectedHandlers.push(() =>
          this.#rejectedHandler(resolve, reject, onRejected)
        );
      }
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  // Promise.finally adapted from:
  // https://gist.github.com/developit/d970bac18430943e4b3392b029a2a96c#file-finally-polyfill-js
  finally(callback) {
    if (typeof callback !== 'function') {
      return this.then(callback, callback);
    }
    // get the current promise or a new one
    const P = this.constructor;

    // return the promise and call the callback function
    // as soon as the promise is rejected or resolved with its value
    return this.then(
      (value) => P.resolve(callback()).then(() => value),
      (err) =>
        P.resolve(callback()).then(() => {
          throw err;
        })
    );
  }
}
