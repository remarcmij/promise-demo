# promise-demo

This repository features two example promise implementations, for demo purposes only.

## Example Promise Implementations

The first implementation (`sync-promise.js`) is the simplest. It is a synchronous version truly for demo use only and does not work in conjunction with asynchronous events. (And consequently, essentially useless for practical purposes.)

The second implementation (`async-promise.js`) is an asynchronous version that utilizes microtasks. This version mimics more closely (but not fully) the native `Promise` implementation that conforms to the [Promises/A+](https://promisesaplus.com/) standard.

`Promise` implementations in folder `promises`:

| File             | Description                          |
| ---------------- | ------------------------------------ |
| sync-promise.js  | Synchronous Promise implementation.  |
| async-promise.js | Asynchronous Promise implementation. |

## Example Promise consumers

Example `Promise` consumers in root folder:

| File             | Description                                |
| ---------------- | ------------------------------------------ |
| 1-sync-chain.js  | Consumes a `SyncPromise` in a chain.       |
| 2-async-chain.js | Consumes `AsyncPromise` in a chain.        |
| 3-await.js       | Consumes a promise using `async/await`.    |
| 4-all-chain.js   | Example: `Promise.all().then(...).catch()` |
| 5-all-await.js   | Example: `await Promise.all()`             |

To run a command from a terminal window, type `node` follow by a space and the starting number of the example file name, then press the <kbd>Tab</kbd>key for auto-completion, followed by another space and finally the `<option>` number expected by the command.

## Promise Chain Examples

The promise chain examples 1 & 2 have this code in common:

```js
function main(option) {
  console.log('<<< main starting >>>');

  // Create a promise corresponding to <option>
  const p = new Promise(...);

  p.then(() => {
    console.log('>> then#1');
  })
    .then(() => {
      console.log('>> then#2');
    })
    .catch(() => {
      console.log('>> catch#3');
    })
    .catch(() => {
      console.log('>> catch#4');
    })
    .then(() => {
      console.log('>> then#5');
    });

  console.log('<<< main ending >>>');
}
```

### 1-sync-chain.js

```text
node 1-sync-chain <option>
```

Where `<option>` is a number from the bullet list below.

1. Consume an immediately resolved **synchronous** promise.

   ```text
   <<< main starting >>>
   >> then#1
   >> then#2
   >> then#5
   <<< main ending >>>
   ```

   Notice that the `main()` function exits after completion of the promise chain. This is because of the synchronous nature of this promise implementation.

2. Consume an immediately rejected **synchronous** in a chain.

   ```text
   <<< main starting >>>
   >> catch#3
   >> then#5
   <<< main ending >>>
   ```

   As before, the `main()` function exists after completion of the promise chain.

_All remaining examples use custom asynchronous promises imported from_ `async-promise.js`.

### 2-async-chain.js

```text
node 2-async-chain <option>
```

With `<option>`:

0. Consume an indefinitely pending promise in a chain.

   ```text
   <<< main starting >>>
   [promise#1 pending]
   [promise#2 pending]
   [promise#3 pending]
   [promise#4 pending]
   [promise#5 pending]
   [promise#6 pending]
   <<< main ending >>>
   ```

   Note: the initial `promise#1` and all subsequent promises created by the `.then()` and `.catch()` methods in the chain remain pending indefinitely.

1. Consume an immediately resolved promise in a chain.

   ```text
   <<< main starting >>>
   [promise#1 fulfilled]
   [enqueue microtask#1]
   [promise#2 pending]
   [promise#3 pending]
   [promise#4 pending]
   [promise#5 pending]
   [promise#6 pending]
   <<< main ending >>>

   [microtask#1 start]
   >> then#1
   [enqueue microtask#2]
   [microtask#1 exit]

   [microtask#2 start]
   >> then#2
   [enqueue microtask#3]
   [microtask#2 exit]

   [microtask#3 start]
   [enqueue microtask#4]
   [microtask#3 exit]

   [microtask#4 start]
   [enqueue microtask#5]
   [microtask#4 exit]

   [microtask#5 start]
   >> then#5
   [microtask#5 exit]
   ```

   Discussion:

   1. The immediately resolved `promise#1` enqueues `microtask#1` during the execution of `main()`.
   2. The pending promises `promise#2`...`promise#6` are created by the calls to the `then()` and `catch()` methods in the chain and are settled later, after `main()` has run to completion.
   3. The settling of the initial promise causes `microtask#1` to be enqueued.
   4. Once `main()` has run to completion (i.e. exited), the JavaScript engine takes `microtask#1` off the microtask queue and invokes the `onFulfilled()` callback of the first `.then()`. 4. Both `microtask#1` and `microtask#2` invoke a `.then(onFulfilled)` callback and then enqueue a microtask for the promise returned by `.then()`. 5. Microtasks #3-4 are associated with the `.catch()` methods in the chain. There are no `onFulfilled()` callbacks to call, only a microtask to enqueue to continue the chain. 6. Microtask #5 invokes the `onFulfilled()` callback of the last `.then()`. 7. Promise #6 is a final promise returned by the promise chain itself. Because it is never consumed with a `.then()` or `.catch()` there is no associated microtask.

2. Consume an immediately rejected asynchronous promise in a chain.

   ```text
   <<< main starting >>>
   [promise#1 rejected]
   [enqueue microtask#1]
   [promise#2 pending]
   [promise#3 pending]
   [promise#4 pending]
   [promise#5 pending]
   [promise#6 pending]
   <<< main ending >>>

   [microtask#1 start]
   [enqueue microtask#2]
   [microtask#1 exit]

   [microtask#2 start]
   [enqueue microtask#3]
   [microtask#2 exit]

   [microtask#3 start]
   >> catch#3
   [enqueue microtask#4]
   [microtask#3 exit]

   [microtask#4 start]
   [enqueue microtask#5]
   [microtask#4 exit]

   [microtask#5 start]
   >> then#5
   [microtask#5 exit]
   ```

   Notes:

   1. Microtasks #1-2 are handled by the first two `.then()` methods. As each of them has no `onRejected()` callback to call only a new microtask enqueued to continue the chain. So, microtask#3 is created by the second `.then()`.
   2. Microtask #3 executes the `onRejected()` callback from the first `.catch()`. This callback happens to return `undefined` hence a promise that resolves to `undefined`.
   3. As the second `.catch()` has no `onFulfilled()` callback microtask#1
   4. Microtask #5 is handled by the final `.then()` and receives the resolved value returns a resolved promise (it resolves to `undefined`). Therefore microtask#4

3. Consume an delayed resolved promise in a chain.

   ```text
   <<< main starting >>>
   [promise#1 pending]
   [promise#2 pending]
   [promise#3 pending]
   [promise#4 pending]
   [promise#5 pending]
   [promise#6 pending]
   <<< main ending >>>
   .
   . (2 second delay)
   .
   [enqueue microtask#1]

   [microtask#1 start]
   >> then#1
   [enqueue microtask#2]
   [microtask#1 exit]

   [microtask#2 start]
   >> then#2
   [enqueue microtask#3]
   [microtask#2 exit]

   [microtask#3 start]
   [enqueue microtask#4]
   [microtask#3 exit]

   [microtask#4 start]
   [enqueue microtask#5]
   [microtask#4 exit]

   [microtask#5 start]
   >> then#5
   [microtask#5 exit]
   ```

   Notes:

   1. All promises, including #1 remain `pending` within function `main()`.
   2. The chain becomes active when the initial promise is settled after a 2 second delay.

4. Consume an delayed rejected promise in a chain.

   ```text
   <<< main starting >>>
   [promise#1 pending]
   [promise#2 pending]
   [promise#3 pending]
   [promise#4 pending]
   [promise#5 pending]
   [promise#6 pending]
   <<< main ending >>>
   .
   . (2 second delay)
   .
   [enqueue microtask#1]

   [microtask#1 start]
   [enqueue microtask#2]
   [microtask#1 exit]

   [microtask#2 start]
   [enqueue microtask#3]
   [microtask#2 exit]

   [microtask#3 start]
   >> catch#3
   [enqueue microtask#4]
   [microtask#3 exit]

   [microtask#4 start]
   [enqueue microtask#5]
   [microtask#4 exit]

   [microtask#5 start]
   >> then#5
   [microtask#5 exit]
   ```

   Same as previous example, but now for a rejected promise.

### 3-await.js

```text
node 3-await <option>
```

With `<option>`:

1. Consume an delayed resolved promise using `await`.

   ```text
   <<< main starting >>>
   [promise#1 pending]
   .
   . (2 second delay)
   .
   [promise#2 pending]
   [enqueue microtask#1]

   [microtask#1 start]
   [microtask#1 exit]
   value: 42
   <<< main ending >>>
   ```

   Notes:

   1. The `main()` function is suspended while awaiting promise#1 to settle.
   2. When promise#1 resolves the `main()` resumes and outputs the resolved value.
   3. Promise #2 is a promise created a `.then()` call created behind the scenes by the `await` keyword and remains unconsumed.

2. Consume an delayed rejected promise using `await`.

   ```text
   <<< main starting >>>
   [promise#1 pending]
   [promise#2 pending]
   [enqueue microtask#1]
   .
   . (2 second delay)
   .
   [microtask#1 start]
   [microtask#1 exit]
   error: Oops...
   <<< main ending >>>
   ```

   Notes:

   1. The `main()` function is suspended while awaiting promise#1 to settle.
   2. When promise#1 rejects the `main()` function resumes and, through its catch block, outputs the rejected error.

### 4-all-chain.js

```text
node 4-all-chain <option>
```

Using:

```js
Promise.all()
  .then(...)
  .catch(...)
```

With `<option>`:

1. Consume an array of delayed resolved promises.

   ```text
   <<< main starting >>>
   [promise#1 pending]
   [promise#2 pending]
   [promise#3 pending]
   [promise#4 pending]
   <<< main ending >>>
   [promise#5 pending]
   [promise#6 pending]
   [promise#7 pending]
   [promise#8 pending]
   .
   . (2 second delay)
   .
   [enqueue microtask#1]

   [microtask#1 start]
   [microtask#1 exit]
   [enqueue microtask#2]

   [microtask#2 start]
   [microtask#2 exit]
   [enqueue microtask#3]

   [microtask#3 start]
   [microtask#3 exit]
   [enqueue microtask#4]

   [microtask#4 start]
   [microtask#4 exit]
   results: [ 42, 42, 42, 42 ]
   ```

   Notes:

   1. `Promise.all()` internally calls `.then()` on each promise in the array. Each call to `.then()` creates a new promise resulting in promises #5-8. Since these additional promises remain unconsumed there are no associated microtasks.
   2. Microtasks #1-4 start execution after `main()` has run to completion.

2. Consume an array of delayed rejected promises.

   ```text
   <<< main starting >>>
   [promise#1 pending]
   [promise#2 pending]
   [promise#3 pending]
   [promise#4 pending]
   <<< main ending >>>
   [promise#5 pending]
   [promise#6 pending]
   [promise#7 pending]
   [promise#8 pending]
   .
   . (2 second delay)
   .
   [enqueue microtask#1]

   [microtask#1 start]
   [microtask#1 exit]
   error: Oops...
   [enqueue microtask#2]

   [microtask#2 start]
   [microtask#2 exit]
   [enqueue microtask#3]

   [microtask#3 start]
   [microtask#3 exit]
   [enqueue microtask#4]

   [microtask#4 start]
   [microtask#4 exit]
   ```

   As in the previous example, but now for a rejected promise.

### 5-all-await.js

```text
node 4-all-await <option>
```

Using:

```js
try {
  const results = await Promise.all(...);
  ...
} catch(err) {
  ...
}
```

With `<option>`:

1. Consume an array of delayed resolved promises.

   ```text
   <<< main starting >>>
   [promise#1 pending]
   [promise#2 pending]
   [promise#3 pending]
   [promise#4 pending]
   [promise#5 pending]
   [promise#6 pending]
   [promise#7 pending]
   [promise#8 pending]
   .
   . (2 second delay)
   .
   [enqueue microtask#1]

   [microtask#1 start]
   [microtask#1 exit]
   [enqueue microtask#2]

   [microtask#2 start]
   [microtask#2 exit]
   [enqueue microtask#3]

   [microtask#3 start]
   [microtask#3 exit]
   [enqueue microtask#4]

   [microtask#4 start]
   [microtask#4 exit]
   results: [ 42, 42, 42, 42 ]
   <<< main ending >>>
   ```

   Notes:

   1. The `main()` function is suspended while awaiting the promise returned by `Promise.all()`.
   2. Promises #5-8 are created internally by `Promise.all()` and remain unconsumed.

2. Consume an array of delayed rejected promises.

   ```text
   <<< main starting >>>
   [promise#1 pending]
   [promise#2 pending]
   [promise#3 pending]
   [promise#4 pending]
   [promise#5 pending]
   [promise#6 pending]
   [promise#7 pending]
   [promise#8 pending]
   .
   . (2 second delay)
   .
   [enqueue microtask#1]

   [microtask#1 start]
   [microtask#1 exit]
   error: Oops...
   <<< main ending >>>
   [enqueue microtask#2]

   [microtask#2 start]
   [microtask#2 exit]
   [enqueue microtask#3]

   [microtask#3 start]
   [microtask#3 exit]
   [enqueue microtask#4]

   [microtask#4 start]
   [microtask#4 exit]
   ```

   Notes:

   1. The first rejected promise (#1) causes the `main()` function to resume running its `catch` block. It then runs to completion and exits. The microtasks of remaining (rejected) promises #3-4 will still execute.
   2. Promises #5-8 are created internally by `Promise.all()` and remain unconsumed.
