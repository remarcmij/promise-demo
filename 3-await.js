import { createPromise } from './helpers/helpers.js';

async function main(number) {
  console.log('<<< main starting >>>');

  try {
    const value = await createPromise(number);
    console.log('value:', value);
  } catch (err) {
    console.log('error:', err.message);
  }

  console.log('<<< main ending >>>');
}

main(+process.argv[2]);
