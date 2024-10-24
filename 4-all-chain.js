import { createPromise } from './helpers/helpers.js';
import { AsyncPromise as Promise } from './promises/async-promise.js';

function main(number) {
  console.log('<<< main starting >>>');

  const promises = [createPromise(number), createPromise(number)];

  Promise.all(promises)
    .then((results) => console.log('>>> results:', results))
    .catch((err) => console.log('>>> error:', err.message));

  console.log('<<< main ending >>>');
}

main(+process.argv[2]);
