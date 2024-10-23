import { createPromise } from './helpers/createPromise.js';

async function main(option) {
  console.log('<<< main starting >>>');

  try {
    const value = await createPromise(option);
    console.log('value:', value);
  } catch (err) {
    console.log('error:', err.message);
  }

  console.log('<<< main ending >>>');
}

main(+process.argv[2]);
