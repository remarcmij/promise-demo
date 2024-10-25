# promise-demo

This repository features two example promise implementations, for demo purposes only. The more advanced implementation uses [microtasks](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) and logs important events to the console while processing each promise. This may help to deepen your understanding of how promises work. (Or it did at least do so for the author :smiley:.)

## Introduction

In order to better understand the result output of each example it important to recollect some important characteristics of promises in JavaScript:

1. The `.then()` method can take [two callback parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then#syntax), the second being optional:

    ```js
    then(onFulfilled)
    then(onFulfilled, onRejected)
    ```

    The second callback, if present, is called when a promise is rejected. In practice, we often see `.then()` being used with only one `onFulfilled` callback, relying on a down-chain `.catch()` method to handle promise rejections.

2. The `.catch()` method is just syntactic sugar for:

    ```js
    then(null, onRejected)
    ```

    In case of a rejected promise `onRejected`, i.e. the second callback parameter is called.

3. Every `.then()` and `.catch()` method call on a promise creates and returns a new promise. These promises are created synchronously, but their callbacks are called asynchronously via a microtask.

    In our custom promise implementation each new promise get assigned a sequence number, starting with 1. All promise events shown in the example output are tagged with the number of the currently executing promise, e.g.:

    ```text
    [promise#1 fulfilled]
    [enqueue microtask#1]
    etc.
    ```

## Example Promise Implementations

The first implementation (`sync-promise.js`) is the simplest. It is a synchronous version truly for demo use only and does not work in conjunction with asynchronous events. Consequently, it is essentially useless for practical purposes, but its implementation is relatively easy to follow (check out `sync-promise.js` in the `promises` folder).

The second implementation (`async-promise.js`) is an asynchronous version that utilizes microtasks. This version mimics more closely (but likely not fully) the native `Promise` implementation that conforms to the [Promises/A+](https://promisesaplus.com/) standard. The code is complicated and not intended here for further discussion. Its value is in the console output it produces as each promise is evaluated.

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

To run a command from a terminal window, type `node` follow by a space and the starting number of the example file name, then press the <kbd>Tab</kbd>key for auto-completion, followed by another space and finally the number expected by the command.

## Promise Chain Examples

The promise chain examples `1-sync-chain`  & `2-async-chain` have this code in common:

```js
function main(number) {
  console.log('<<< main starting >>>');

  createPromise(number)
    .then(() => {
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
node 1-sync-chain <number>
```

Where `<number>` is 1 or 2.

#### `node 1-sync-chain 1`

Consume an immediately resolved **synchronous** promise.

```text
<<< main starting >>>
>> then#1
>> then#2
>> then#5
<<< main ending >>>
```

Notice that the `main()` function exits after completion of the promise chain. This is because of the synchronous nature of this promise implementation.

#### node 1-sync-chain 2

Consume an immediately rejected **synchronous** in a chain.

```text
<<< main starting >>>
>> catch#3
>> then#5
<<< main ending >>>
```

Note: All remaining examples use the `AsyncPromise` class imported from `async-promise.js`.

### 2-async-chain.js

```text
node 2-async-chain <number>
```

Where `<number>` is 0, 1, 2, 3 or 4.

#### `node 2-async-chain 0`

Consume an indefinitely pending promise in a chain.

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

The initial `promise#1` is not programmatically settled and hence all subsequent promises created by the `.then()` and `.catch()` methods in the chain remain pending indefinitely.

#### `node 2-async-chain 1`

A promise chain that consumes an immediately resolved promise.

In total 6 promises are created. The first promise is created explicitly by a call to `createPromise()`. The remaining promises are created synchronously as `pending` promises by the `.then()` and `.catch()` methods in the chain. These methods register their `onFulfilled()` and `onRejected()` callbacks inside the promise they create for later execution.

The promise return by the promise chain is `promise#6`, which in the example code remains unused.

| promise     | created by        |
| ----------- | ----------------- |
| `promise#1` | `createPromise()` |
| `promise#2` | `.then() #1`      |
| `promise#3` | `.then() #2`      |
| `promise#4` | `.catch() #3`     |
| `promise#5` | `.catch() #4`     |
| `promise#6` | `.then() #5`      |

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
[promise#2 fulfilled]
[enqueue microtask#2]
[microtask#1 exit]

[microtask#2 start]
>> then#2
[promise#3 fulfilled]
[enqueue microtask#3]
[microtask#2 exit]

[microtask#3 start]
[promise#4 fulfilled]
[enqueue microtask#4]
[microtask#3 exit]

[microtask#4 start]
[promise#5 fulfilled]
[enqueue microtask#5]
[microtask#4 exit]

[microtask#5 start]
>> then#5
[promise#6 fulfilled]
[microtask#5 exit]
```

Discussion:

1. The immediately resolved `promise#1` enqueues `microtask#1` during the execution of `main()`. The pending promises `promise#2` up to `promise#6` are created synchronously by the calls to the `then()` and `catch()` methods in the chain and will be settled later, after `main()` has run to completion.

2. Once `main()` has exited the JavaScript engine picks up and runs `microtask#1` from the microtask queue. In turn, `microtask#1` invokes the `onFulfilled()` callback of the first `.then()` method in the chain. The return value of the `onFulfilled()` callback is used as to fulfill `promise#2`, which subsequently causes `microtask#2` to be enqueued. This completes the execution of `microtask#1`.

3. Next, the JavaScript engine picks up `microtask#2` from the microtask queue. It follows the same process as describe above, but now for the second `.then()` in the chain.

4. The first `.catch()` methods in the chain is executed by `microtask#3`. By design, a `.catch()` method has no `onFulfilled()` method (i.e. it is `null`). Instead it has an `onRejected()` callback. It is not called in this case as the incoming promise is fulfilled. Therefore `microtask#3` simply enqueues a new microtask for the next method in the chain. In this case, `microtask#4` for the second `.catch()` in the chain.

5. When `microtask#4` is picked up and executed, the same process as in the previous step is followed for the second `.catch()` in the chain. Eventually `microtask#5` is enqueued.

6. When `microtask#5` is executed it invokes the `onFulfilled()` callback of the last `.then()` method in the chain.

7. Since there are no further methods in the chain and no consumer for `promise#6` the process stops here.

#### `node 2-async-chain 2`

A promise chain that consumes a promise that is resolved some time later.

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
[promise#1 fulfilled]
[enqueue microtask#1]

[microtask#1 start]
>> then#1
[promise#2 fulfilled]
[enqueue microtask#2]
[microtask#1 exit]

[microtask#2 start]
>> then#2
[promise#3 fulfilled]
[enqueue microtask#3]
[microtask#2 exit]

[microtask#3 start]
[promise#4 fulfilled]
[enqueue microtask#4]
[microtask#3 exit]

[microtask#4 start]
[promise#5 fulfilled]
[enqueue microtask#5]
[microtask#4 exit]

[microtask#5 start]
>> then#5
[promise#6 fulfilled]
[microtask#5 exit]
```

Discussion:

This is similar to the previous example, but now `promise#1` begins as pending promise.

#### `node 2-async-chain 3`

A promise chain that consumes an immediately rejected promise.

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
[promise#2 rejected]
[enqueue microtask#2]
[microtask#1 exit]

[microtask#2 start]
[promise#3 rejected]
[enqueue microtask#3]
[microtask#2 exit]

[microtask#3 start]
>> catch#3
[promise#4 fulfilled]
[enqueue microtask#4]
[microtask#3 exit]

[microtask#4 start]
[promise#5 fulfilled]
[enqueue microtask#5]
[microtask#4 exit]

[microtask#5 start]
>> then#5
[promise#6 fulfilled]
[microtask#5 exit]
```

Discussion:

1. In the case of an rejected promise the `onFulfilled()` callbacks of the `.then()` methods in the chain are bypassed until the first `.catch()` method is encountered. Its `onRejected()` callback is called which happens to return `undefined`, which becomes the fulfillment value its promise (`promise#4`).

2. Because the second `.catch()` now sees a fulfilled promise, its `onRejected()` callback is bypassed and it simply forwards the fulfillment value of the previous promise.

3. The last `.then()` in the chain sees a fulfilled promise and therefore calls its `onFulfilled()` callback. This ends the process.

#### `node 2-async-chain 4`

A promise chain that consumes a promise that is rejected some time later.

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
[promise#1 rejected]
[enqueue microtask#1]

[microtask#1 start]
[promise#2 rejected]
[enqueue microtask#2]
[microtask#1 exit]

[microtask#2 start]
[promise#3 rejected]
[enqueue microtask#3]
[microtask#2 exit]

[microtask#3 start]
>> catch#3
[promise#4 fulfilled]
[enqueue microtask#4]
[microtask#3 exit]

[microtask#4 start]
[promise#5 fulfilled]
[enqueue microtask#5]
[microtask#4 exit]

[microtask#5 start]
>> then#5
[promise#6 fulfilled]
[microtask#5 exit]
```

Discussion:

This is similar to the previous example, but now `promise#1` begins as pending promise.

### 3-await.js

Example code:

```js
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
```

The `createPromise()` helper function creates a promise is settled after a two second delay. If `number` is 1 it returns a promise that is resolved to the value `42`. If `number` is 2 it returns a promise that is rejected with an `Error` object as its rejection value.

#### `node 3-wait 1`

Consume a promise that is resolved some time later, using `await`.

```text
<<< main starting >>>
[promise#1 pending]
[promise#2 pending]
.
. (2 second delay)
.
[promise#1 fulfilled]
[enqueue microtask#1]

[microtask#1 start]
[promise#2 fulfilled]
[microtask#1 exit]
value: 42
<<< main ending >>>
```

Discussion:

1. The `main()` function is suspended while awaiting `promise#1`.
2. When `promise#1` fulfills the `main()` function resumes and outputs the resolved value.
3. Promise #2 is a promise created a `.then()` call created internally by the `await` keyword and remains unconsumed.

#### `node 3-wait 2`

Consume a promise that is rejected some time later, using `await`.

```text
<<< main starting >>>
[promise#1 pending]
[promise#2 pending]
.
. (2 second delay)
.
[promise#1 rejected]
[enqueue microtask#1]

[microtask#1 start]
[promise#2 fulfilled]
[microtask#1 exit]
error: Oops... Something went wrong!
<<< main ending >>>
<<< main ending >>>
```

Discussion:

1. The `main()` function is suspended while awaiting `promise#1` to settle.
2. When `promise#1` rejects the `main()` function resumes and, through its catch block, outputs the rejected error.

### 4-all-chain.js

Example code:

```js
function main(number) {
  console.log('<<< main starting >>>');

  const promises = [createPromise(number), createPromise(number)];

  Promise.all(promises)
    .then((results) => console.log('results:', results))
    .catch((err) => console.log('error:', err.message));

  console.log('<<< main ending >>>');
}
```

The same `createPromise()` helper function from the previous examples is used here.

#### `node 4-all-chain 1`

Using a `Promise.all()` chain, consume an array of two promises that are resolved some time later.

There are a lot of promises created here:

| promise     | created by |
| ----------- | ---------- |
| `promise#1` | First call to `createPromise()` |
| `promise#2` | Second call to `createPromise()` |
| `promise#3` | Promise returned by `Promise.all()` |
| `promise#4` | `.then()` called on `promise#1` inside `Promise.all()` |
| `promise#5` | `.catch()` called on `promise#1` inside `Promise.all()` |
| `promise#6` | `.then()` called on `promise#2` inside `Promise.all()` |
| `promise#7` | `.catch()` called on `promise#2` inside `Promise.all()` |
| `promise#8` | `.then()` inside function `main()` |
| `promise#9` | `.catch()` inside function `main()` |

```text
<<< main starting >>>
[promise#1 pending]
[promise#2 pending]
[promise#4 pending]
[promise#5 pending]
[promise#6 pending]
[promise#7 pending]
[promise#3 pending]
[promise#8 pending]
[promise#9 pending]
<<< main ending >>>
.
. (2 second delay)
.
[promise#1 fulfilled]
[enqueue microtask#1]

[microtask#1 start]
[promise#4 fulfilled]
[enqueue microtask#4]
[microtask#1 exit]

[microtask#4 start]
[promise#5 fulfilled]
[microtask#4 exit]
[promise#2 fulfilled]
[enqueue microtask#2]

[microtask#2 start]
[promise#3 fulfilled]
[enqueue microtask#3]
[promise#6 fulfilled]
[enqueue microtask#6]
[microtask#2 exit]

[microtask#3 start]
>>> results: [ 42, 42 ]
[promise#8 fulfilled]
[enqueue microtask#8]
[microtask#3 exit]

[microtask#6 start]
[promise#7 fulfilled]
[microtask#6 exit]

[microtask#8 start]
[promise#9 fulfilled]
[microtask#8 exit]
```

Discussion:

#### `node 4-all-chain 2`

Using a `Promise.all()` chain, consume an array of two promises that are rejected some time later.

```text
<<< main starting >>>
[promise#1 pending]
[promise#2 pending]
[promise#4 pending]
[promise#5 pending]
[promise#6 pending]
[promise#7 pending]
[promise#3 pending]
[promise#8 pending]
[promise#9 pending]
<<< main ending >>>
.
. (2 second delay)
.
[promise#1 rejected]
[enqueue microtask#1]

[microtask#1 start]
[promise#4 rejected]
[enqueue microtask#4]
[microtask#1 exit]

[microtask#4 start]
[promise#3 rejected]
[enqueue microtask#3]
[promise#5 fulfilled]
[microtask#4 exit]

[microtask#3 start]
[promise#8 rejected]
[enqueue microtask#8]
[microtask#3 exit]

[microtask#8 start]
>>> error: Oops... Something went wrong!
[promise#9 fulfilled]
[microtask#8 exit]
[promise#2 rejected]
[enqueue microtask#2]

[microtask#2 start]
[promise#6 rejected]
[enqueue microtask#6]
[microtask#2 exit]

[microtask#6 start]
[promise#7 fulfilled]
[microtask#6 exit]
```

Discussion:

### 5-all-await.js

Example code:

```js
async function main(number) {
  console.log('<<< main starting >>>');

  try {
    const promises = [createPromise(number), createPromise(number)];

    const results = await Promise.all(promises);
    console.log('results:', results);
  } catch (err) {
    console.log('error:', err.message);
  }

  console.log('<<< main ending >>>');
}
```

### `node 5-all-await 1`

Using an awaited `Promise.all()`, consume an array of two promises that are resolved some time later.

The created promises are:

| promise     | created by |
| ----------- | ---------- |
| `promise#1` | First call to `createPromise()` |
| `promise#2` | Second call to `createPromise()` |
| `promise#3` | Promise returned by `Promise.all()` |
| `promise#4` | `.then()` called on `promise#1` inside `Promise.all()` |
| `promise#5` | `.catch()` called on `promise#1` inside `Promise.all()` |
| `promise#6` | `.then()` called on `promise#2` inside `Promise.all()` |
| `promise#7` | `.catch()` called on `promise#2` inside `Promise.all()` |
| `promise#8` | `await` inside function `main()` |

```text
<<< main starting >>>
[promise#1 pending]
[promise#2 pending]
[promise#4 pending]
[promise#5 pending]
[promise#6 pending]
[promise#7 pending]
[promise#3 pending]
[promise#8 pending]
.
. (2 second delay)
.
[promise#1 fulfilled]
[enqueue microtask#1]

[microtask#1 start]
[promise#4 fulfilled]
[enqueue microtask#4]
[microtask#1 exit]

[microtask#4 start]
[promise#5 fulfilled]
[microtask#4 exit]
[promise#2 fulfilled]
[enqueue microtask#2]

[microtask#2 start]
[promise#3 fulfilled]
[enqueue microtask#3]
[promise#6 fulfilled]
[enqueue microtask#6]
[microtask#2 exit]

[microtask#3 start]
[promise#8 fulfilled]
[microtask#3 exit]

[microtask#6 start]
[promise#7 fulfilled]
[microtask#6 exit]
>>> results: [ 42, 42 ]
<<< main ending >>>
```

Discussion:

While doable, it would be a bit long-winding to discuss the output in detail. However, it is worth noting that the `main()` function waits for `Promise.all()` to resolve before exiting.

### `node 5-all-await 2`

Using an awaited `Promise.all()`, consume an array of two promises that are rejected some time later.

The created promises are the same as in the previous example.

```text
<<< main starting >>>
[promise#1 pending]
[promise#2 pending]
[promise#4 pending]
[promise#5 pending]
[promise#6 pending]
[promise#7 pending]
[promise#3 pending]
[promise#8 pending]
.
. (2 second delay)
.
[promise#1 rejected]
[enqueue microtask#1]

[microtask#1 start]
[promise#4 rejected]
[enqueue microtask#4]
[microtask#1 exit]

[microtask#4 start]
[promise#3 rejected]
[enqueue microtask#3]
[promise#5 fulfilled]
[microtask#4 exit]

[microtask#3 start]
[promise#8 fulfilled]
[microtask#3 exit]
>>> error: Oops... Something went wrong!
<<< main ending >>>
[promise#2 rejected]
[enqueue microtask#2]

[microtask#2 start]
[promise#6 rejected]
[enqueue microtask#6]
[microtask#2 exit]

[microtask#6 start]
[promise#7 fulfilled]
[microtask#6 exit]
```

Discussion:

1. The `main()` function exits when `Promise.all()` is settled by a rejection.

2. Most promises are rejected. However, `promise#5` and `promise#7` are fulfilled with the return value (`undefined`) of the interval `.catch()` handlers of `Promise.all()`.

3. The `catch {}` block inside function `main()` does not throw an error itself, therefore `promise#8` is settled as fulfilled.
