import { AsyncPromise as Promise } from '../promises/async-promise.js';

export function createPromise(option) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (option === 1) {
        resolve(42);
      }
      reject(new Error('Oops...'));
    }, 2000);
  });
}
