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

Unfortunately, pb_ds is only implemented inside GCC/libstdc++. LLVM/libc++ does
not have it.

## Which to choose, Segment Tree, Fenwick tree or PB-DS?

🧮 Comparison Table

| Feature                                             |                     **Segment Tree**                      |         **Fenwick Tree (BIT)**         |          **PBDS (ordered_set)**          |
| :-------------------------------------------------- | :-------------------------------------------------------: | :------------------------------------: | :--------------------------------------: |
| **Typical Use Case**                                |      Range queries (sum, min, max) and point updates      |     Prefix sums and point updates      |  Order statistics (rank, k-th element)   |
| **Supports dynamic insertion of arbitrary values?** | ⚠️ Not directly (needs coordinate compression or rebuild) |  ⚠️ Not directly (needs fixed range)   |          ✅ Yes (balanced tree)          |
| **Insert complexity**                               |                 O(log N) (if range fixed)                 |                O(log N)                |                 O(log N)                 |
| **Query (prefix or count ≤ X)**                     |                         O(log N)                          |                O(log N)                |                 O(log N)                 |
| **Memory usage**                                    |                       ~ 4× N nodes                        |                  ~ N                   |           ~ N (tree overhead)            |
| **Implementation complexity**                       |                         🧩 Medium                         |               🟢 Simple                |      ⚙️ Very simple (if supported)       |
| **Range of values required ahead of time?**         |                ✅ Yes (or use compression)                |                 ✅ Yes                 |                  ❌ No                   |
| **Can find k-th element efficiently?**              |                    ⚠️ With extra logic                    |         ⚠️ With binary search          |     ✅ Built-in (`find_by_order(k)`)     |
| **Can handle duplicates?**                          |                ✅ With care (store counts)                |             ✅ With counts             | ✅ Yes (supports multiset-like behavior) |
| **Standard library support**                        |                         ❌ Manual                         |               ❌ Manual                |        ⚠️ Only in GCC’s libstdc++        |
| **Works with LLVM / macOS?**                        |                          ✅ Yes                           |                 ✅ Yes                 |    ❌ No (unless using GCC/libstdc++)    |
| **Best for...**                                     |         Range queries and sums on numeric indices         | Prefix/count queries on numeric ranges |   Dynamic ranking / counting by value    |

🧠 TL;DR Recommendations

| Scenario                                                               | Best Choice            | Why                                       |
| ---------------------------------------------------------------------- | ---------------------- | ----------------------------------------- |
| Need **count ≤ X** or **count > X** dynamically with arbitrary inserts | **PBDS (ordered_set)** | Easiest, O(log N) both ways               |
| Same need, but on macOS / LLVM (no PBDS)                               | **Fenwick Tree**       | Works anywhere, just compress coordinates |
| Need **range sums / updates** on numeric ranges                        | **Segment Tree**       | More flexible for numeric aggregations    |
