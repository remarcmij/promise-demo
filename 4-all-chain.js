import { createPromise } from './helpers/createPromise.js';
import { AsyncPromise as Promise } from './promises/async-promise.js';

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

main(+process.argv[2]);
