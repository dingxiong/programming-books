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
