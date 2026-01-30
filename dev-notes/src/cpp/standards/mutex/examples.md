# Examples

## Concurrent Queue

```cpp
template<typename T>
class ThreadSafeQueue {
public:
    explicit ThreadSafeQueue(size_t cap) : capacity(cap) {}

    void push(T item) {
        std::unique_lock<std::mutex> lock(mtx);
        not_full.wait(lock, [&]{ return q.size() < capacity; });

        q.push(std::move(item));
        not_empty.notify_one();
    }

    T pop() {
        std::unique_lock<std::mutex> lock(mtx);
        not_empty.wait(lock, [&]{ return !q.empty(); });

        T item = std::move(q.front());
        q.pop();
        not_full.notify_one();
        return item;
    }

private:
    std::queue<T> q;
    size_t capacity;
    std::mutex mtx;
    std::condition_variable not_empty, not_full;
};

```

Note that we notify before unlock. This is fine with a little bit performance
penalty. What happened is

```
Time | Producer              | Consumer (waiting)
-----|----------------------|-------------------------
T1   | lock()               |
T2   | data_ready = true    |
T3   | notify_one()         | (still holding lock)
T4   |                      | wakes up
T5   |                      | tries lock() → BLOCKS (producer has it)
T6   | unlock()             |
T7   |                      | lock() succeeds
T8   |                      | processes data
```

Disadvantages:

- ⚠️ **Less efficient** - notified thread wakes but immediately blocks on the
  mutex
- ⚠️ **Wasted context switch** - thread wakes just to sleep again on the mutex

Usually we prefer unlock before notify.

```
Time | Producer              | Consumer (waiting)
-----|----------------------|-------------------------
T1   | lock()               |
T2   | data_ready = true    |
T3   | unlock()             | (sleeping)
T4   | notify_one()         |
T5   |                      | wakes up
T6   |                      | tries lock() → SUCCESS immediately
T7   |                      | processes data
```
