import { AsyncPromise as Promise } from './promises/async-promise.js';

function createPromise(option) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (option === 1) {
        resolve(42);
      }
      reject(new Error('Oops...'));
    }, 2000);
  });
}

function main(option) {
  console.log('<<< main starting >>>');

  const promises = [
    createPromise(option),
    createPromise(option),
    createPromise(option),
    createPromise(option),
  ];

  Promise.all(promises)
    .then((results) => console.log('results:', results))
    .catch((err) => console.log('error:', err.message));

  console.log('<<< main ending >>>');
}

// From the command line, type: node 4-all-chain <number>
// where <number> is 1, 2
main(+process.argv[2]);
