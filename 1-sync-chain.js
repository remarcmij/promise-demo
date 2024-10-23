import { SyncPromise as Promise } from './promises/sync-promise.js';

function main(option) {
  console.log('<<< main starting >>>');

  new Promise((resolve, reject) => {
    switch (option) {
      case 1:
        resolve();
        break;
      case 2:
        reject();
        break;
    }
  })
    .then(() => {
      console.log('then 1');
    })
    .then(() => {
      console.log('then 2');
    })
    .catch(() => {
      console.log('catch 3');
    })
    .catch(() => {
      console.log('catch 4');
    })
    .then(() => {
      console.log('then 5');
    })
    .finally(() => {
      console.log('finally 6');
    });

  console.log('<<< main ending >>>');
}

// From the command line, type: node 1-sync-chain <number>
// where <number> is 1, 2
main(+process.argv[2]);
