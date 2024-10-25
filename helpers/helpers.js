import { AsyncPromise as Promise } from '../promises/async-promise.js';

export function createPromise(option) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (option === 1) {
        resolve(42);
      } else if (option === 2) {
        reject(new Error('Oops... Something went wrong!'));
      }
    }, 2000);
  });
}
