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

// From the command line, type: node 3-await <number>
// where <number> is 1, 2
main(+process.argv[2]);
