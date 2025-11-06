# Policy-Based Data Structures

Sometimes, we need a data structure that counts the number of integers greater
than a given value x and supports insertion. This mostly happen in a scenario
where you iterate through an array and calculate something for each element and
you would like the overall time complexity to be `O(NlogN)`. You may think of
using `std::set` or `std::multiset` as below.

```cpp
std::set<int> s;
auto iter = set.lower_bound(x);
num = std::distance(iter, s.end());
```

This won't work as expected because `std::distance` has linear time complexity.

In order to make it `O(logN)`, we need some metadata attached to each tree
node. Support you will design it. What metadata you would attach? The size of
the subtree under each node, right? That is the exact idea of policy-based data
structures.

The most commonly used one is the below `pb_set` and `pb_map`. See example
below.

```cpp
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace __gnu_pbds;

template<class K>
using pb_set = tree<
    K,                        // key type
    null_type,                // mapped type (null for set)
    std::less<K>,             // comparator
    rb_tree_tag,              // underlying tree = red-black tree
    tree_order_statistics_node_update>; // enables order stats

template<class K, class V>
using pb_map = tree<
    K,
    V,
    std::less<K>,
    rb_tree_tag,
    tree_order_statistics_node_update>;

int main() {
    pb_set<int> s;
    s.insert(1); s.insert(3); s.insert(5);
    for (int i = 0; i <= 6; i++) cout << s.order_of_key(i) << endl;
    // output: 0 0 1 1 2 2 3
}
```

## Implementation Details

See the
[interface description](https://github.com/gcc-mirror/gcc/blob/35e029530f256bb6302a3cae650d7eaef5514a36/libstdc++-v3/include/ext/pb_ds/tree_policy.hpp#L100)
and the implementation
[here](https://github.com/gcc-mirror/gcc/blob/35e029530f256bb6302a3cae650d7eaef5514a36/libstdc++-v3/include/ext/pb_ds/detail/tree_policy/order_statistics_imp.hpp#L79).
Basically, function `order_of_key` sums the metadata of all the left nodes of
the current node. The metadata is calculated in the `operator()(...)` function
which is the count of nodes in the subtree.

So we should expect `__gnu_pbds::tree<...>` should implement all `std::map`
methods, such as `insert`, `erase` and etc. But when I use it in practice, I
found it does not have `emplace(...)` method. What the hell! Since this is a
not a standardized container, this is totally possible. I decided to figure out
what interfaces it defines. With AI's help, I figure out almost all its methods
inherit from
[rb_tree_map](https://github.com/gcc-mirror/gcc/blob/35e029530f256bb6302a3cae650d7eaef5514a36/libstdc++-v3/include/ext/pb_ds/detail/rb_tree_map_/rb_tree_.hpp#L84).
Yes, the base class is determined by the tag you passed in the template.
`rb_tree_map` is a subclass of
[bin_search_tree_map](https://github.com/gcc-mirror/gcc/blob/35e029530f256bb6302a3cae650d7eaef5514a36/libstdc++-v3/include/ext/pb_ds/detail/bin_search_tree_/bin_search_tree_.hpp#L109).
`bin` means `binary`. Make sense. Red-black tree is a binary tree.

From `bin_search_tree_map`, it gets

- `empty()`
- `size()`
- `max_size()`: Returns the maximum possible number of elements.
- `lower_bound(key)`
- `upper_bound(key)`
- `find(key)`: Finds an element with a specific key.
- `begin()`
- `end()`
- `rbegin()`
- `rend()`
- `clear()`

From `rb_tree_map` (the red-black tree specific operations), it gets

- `insert(value)`
- `operator[](key)`
- `erase(key)` or `erase(iterator)`
- `join(other_tree)`: Merges another tree into the current one.
- `split(key, other_tree)`: Splits the tree into two based on a key.

Unfortunately, pb_ds is only implemented inside GCC/libstdc++. LLVM/libc++ does
not have it.

## Which to choose, Segment Tree, Fenwick tree or PB-DS?

All three options solve the similar problem. The TL;DR recommendations are
summarized in below table.

| Scenario                                                               | Best Choice      | Why                                       |
| ---------------------------------------------------------------------- | ---------------- | ----------------------------------------- |
| Need **count ≤ X** or **count > X** dynamically with arbitrary inserts | **PBDS**         | Easiest, O(log N) both ways               |
| Same need, but on macOS / LLVM (no PBDS)                               | **Fenwick Tree** | Works anywhere, just compress coordinates |
| Need **range sums / updates** on numeric ranges                        | **Segment Tree** | More flexible for numeric aggregations    |
