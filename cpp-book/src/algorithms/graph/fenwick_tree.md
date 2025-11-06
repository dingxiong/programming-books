# Fenwick Tree

A Fenwick tree (also called a Binary Indexed Tree or BIT) is a data structure
that efficiently supports two operations on an array:

- Update: Modify a single element
- Prefix sum query: Calculate the sum of elements from index 0 to any given
  index

Both operations run in `O(log n)` time. So the difference between BIT and
segment tree is that the latter can define different aggregation; while the
former is only for prefix sum query. See the "Policy-Based Data Structures"
post about which to choose.

## Implementation

The key insight is that any number can be represented as a sum of powers of 2.
The Fenwick tree stores partial sums in a clever way where:

- Each index is responsible for a range of elements.
- The range size is determined by the lowest set bit in the index.

Index `2^k` stores sum of index `2^{k-1} + 1`, `2^{k-1} + 2`, ... `2^k`. Note
index starts from `1` not `0`. For example, in a Fenwick tree:

- Index 1 (binary: 001) stores sum of 1 elements: `001`.
- Index 4 (binary: 100) stores sum of 4 elements: `001`, `010`, `011`, `100`
- Index 6 (binary: 110) stores sum of 2 elements: `110`, `101`.

From this we can see given an index `i`, it must be responsible for the value
at index itself. Then we change the lowest set bit to zero, and sums up all
indices with combinations of the lower bits.

```cpp
struct FenwickTree {
    vector<int> bit;
    int n;

    // bit starts from index 1.
    FenwickTree(int n) : n(n), bit(n + 1) {}

    void update(int i, int delta) {
        // why ++i? Indices are 1-indexed internally.
        for (++i; i <= n; i += i & -i)
            bit[i] += delta;
    }

    int query(int i) {
        int sum = 0;
        for (++i; i > 0; i -= i & -i)
            sum += bit[i];
        return sum;
    }

    int rangeQuery(int l, int r) {
        return query(r) - (l ? query(l - 1) : 0);
    }
};
```

The trick `i & -i` isolates the lowest set bit.

- `i + (i & -i)`: jump to next responsible index.
- `i - (i & -i)`: jump to previous range.

To be honest, even with so many hints, I find it is still hard to remember this
implementation.
