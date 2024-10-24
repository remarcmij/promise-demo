import { createPromise } from './helpers/helpers.js';
import { AsyncPromise as Promise } from './promises/async-promise.js';

async function main(number) {
  console.log('<<< main starting >>>');

  try {
    const promises = [createPromise(number), createPromise(number)];

    const results = await Promise.all(promises);
    console.log('>>> results:', results);
  } catch (err) {
    console.log('>>> error:', err.message);
  }

  console.log('<<< main ending >>>');
}

main(+process.argv[2]);
