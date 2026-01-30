# Mutex

Why name it `unique_lock`? Because we have `shared_lock` as well. This
corresponds to `unique_ptr` and `shared_ptr`. Note, `condition_variable` only
accept `unique_lock`.

## Why we need `std::condition_variable`

`std::mutex.lock()` is blocking and returns when some other thread unlocks this
mutex, so it can effectively signal that some resource is ready. Then why we
need `std::condition_variable`?

Suppose we are implementing a concurrent queue, and for the `get` method, you
have a naive implementation pseudocode below.

```cpp
std::mutex mtx;
vector<T> q;

void put(T item) {
  mtx.lock(); q.push_back(item); mtx.unlock();
}

T get() {
  mtx.lock(); auto item = q[0]; mtx.unlock();
  return item;
}
```

The won't work because the `get` thread cannot guarantee the queue is non-empty
when it successfully gets the lock. This is the nature of mutex. There is no
guarantee of which thread can get the lock first and in which order. To fix it,
you have a second version below.

```cpp
T get() {
  mtx.lock();
  while (q.empty() {
    mtx.unlock();
    sleep(100ms);
    mtx.lock();
  }
  auto item = q[0];
  mtx.unlock();
  return item;
}
```

It pulls the status of the queue periodically. Why we need the sleep step in
the loop? Without it, it is possible that this consumer thread immediately
locks the mutex again after unlock, so the producer thread may never get the
lock. This is inefficient. We need a semantics that put the current thread in a
waiting list and only wakes up if the other thread tells it to wake up,
something like below.

```cpp
  while (q.empty() {
    mtx.unlock();
    sleep_until_notified();
    mtx.lock();
  }
```

But this code is not thread-safe. Between `mutx.unlock()` and
`sleep_until_notified()`, the other thread might have add the new item to the
queue and sent out the notification, so this thread will never receives the
notification and will sleep forever. What we need is
`atomically_unlock_and_sleep()`.

```cpp
  while (q.empty() {
    atomically_unlock_and_sleep();
    mtx.lock();
  }
```

This is exact what `condition_variable::wait` does.

```cpp
T get() {
  unique_lock<std::mutex> lock(mtx);
  cv.wait(lock, [&q](){ return not q.empty(); });
  auto item = q[0];
  lock.unlock();
  return item;
}
```

## Wrappers on top of pthread.

C++ mutex and condition_variable apis are just wrappers on top of pthread api:

- `pthread_mutex_lock`, `pthread_mutex_unlock`.
- `pthread_cond_wait`, `pthread_cond_signal`, `pthread_cond_broadcast`.

For example, see
[source code](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/src/condition_variable.cpp#L27).
In Linux, they are all implemented using `futex`.
