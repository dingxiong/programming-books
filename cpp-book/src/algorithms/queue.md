# Priority Queue

I do not like `std::priority_queue` because it does not provide the `begin` nor
`end` iterator. Later on, I learned a set of functions to deal with max heap
directly: `make_heap`, `push_heap` and `pop_heap`. I am very happy with it
because it allows me implementing priority queue on top of vector, and I can
iterate vector! Then I suspect the push/pop operation of `std::priority_queue`
is just a wrapper of `push_heap`/`pop_heap`. It is! See
[code](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/queue#L899).

## Constructors

A few examples.

```cpp
priority_queue<int, std::vector<int>, std::greater<int>> pq;
```

```cpp
auto comp = std::greater<int>{};
priority_queue<int, std::vector<int>, decltype(comp)> pq(comp);
```

```cpp
vector v = {1, 2, 3, 5};
priority_queue<int> pq(v.begin(), v.end());
```

Just want to point out the last constructor has time complexity `O(N)`, not
`O(NlogN)`. Underneath, it just calls
[std::make_heap](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/queue#L786).

## Heap

What is a max heap?

1. A heap must be a complete binary tree, meaning all levels are fully filled
   except possibly the last level, which fills from left to right. If we store
   it in an array `arr` with `arr[0]` being the root, then left and right of
   `arr[i]` are `arr[2*i+1]` and `arr[2*i+2]`.

2. For max heap, every parent node is greater or equal to its children. Min
   heap is reverse.

The bottom-up heapify process takes `O(N)` steps.

```cpp
void heapify_down(vector<int>& a, int n, int i) {
    int mx = i, l = 2*i + 1, r = 2*i + 2;
    if (l < n && a[l] > a[mx]) mx = l;
    if (r < n && a[r] > a[mx]) mx = r;
    if (mx != i) {
        swap(a[i], a[mx]);
        heapify_down(a, n, mx);
    }
}

// Build max heap - O(n)
void make_heap(vector<int>& a) {
    for (int i = a.size()/2 - 1; i >= 0; i--)
        heapify_down(a, a.size(), i);
}

// Insert element at end and heapify up - O(log n)
void push_heap(vector<int>& a) {
    int i = a.size() - 1;
    while (i > 0 && a[(i-1)/2] < a[i]) { // parent at index (i-1)/2
        swap(a[i], a[(i-1)/2]);
        i = (i-1)/2;
    }
}

// Remove max (root), move last to root, heapify down - O(log n)
void pop_heap(vector<int>& a) {
    swap(a[0], a[a.size()-1]);
    heapify_down(a, a.size()-1, 0);
}
```
