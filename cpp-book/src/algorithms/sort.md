# Comparator

`std::sort` can pass a `comp` parameter at the end. If not specified, then it
is defaults to
[std::less](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__algorithm/sort.h#L967).

Sometimes, we want to sort nested containers, then how comparison works for
them.

For vector, it is defined as
[std::lexicographical_compare](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__vector/comparison.h#L49).
Basically, it compares element by element until a different one is found or one
vector goes out of range. In the latter case, the short vector is smaller.
`std:string`, `std::deque`, `std::array` `std::pair` and `std::tuple` are
similar to vector. They compare from the first element. If equal, then the
second, and the rest.

`std::set` and `set::map` define `operator<` as well. It is lexicographical
order as well. However, `std::unordered_set` and `std::unordered_map` only
define `operator==` and `operator!=`.

Comparator is also used extensively in sorted containers. `std::set` and
`std::map` has comparator template argument. There is a caveat that

> Everywhere the standard library uses the Compare requirements, uniqueness is
> determined by using the equivalence relation. In imprecise terms, two objects
> a and b are considered equivalent if neither compares less than the other:
> !comp(a, b) && !comp(b, a).

The concrete code is
[here](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__tree#L1705).
Both `set` and `map` are implemented using red-black tree. When inserting a new
element, The case `not a < b and not b < a` means two keys are equal. If you
forget tie breaker, then you may end up with a undetermined behavior. For
example, in Dijkstra shortest path algorithm, we should define the comparator
as

```cpp
auto comp = [&distances](const string &a, const string &b) {
    if (distances[a] != distances[b])
        return distances[a] < distances[b];
    return a < b;
};
```

# Radix Sort

libc++ has a good demonstration of the usage of radix sort. See
[code](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__algorithm/stable_sort.h#L256).

First, it is only used if the container value type is integral. It works for
int32, int64, etc but not floats, strings. Also, it supports negative integrals
as well. See
[code](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__algorithm/radix_sort.h#L298).
Using int8 as an example, the trick `numeric_limits<_Ip>::min() ^ value` can be
explained by below table.

```
┌───────────────────┬───────────────────────┬──────────────────────────┬───────────────────┐
│ Original (Signed) │ Binary Representation │ XOR with -128 (10000000) │ Result (Unsigned) │
├───────────────────┼───────────────────────┼──────────────────────────┼───────────────────┤
│ -128              │ 10000000              │ 10000000 ^ 10000000      │ 00000000 (0)      │
│ -127              │ 10000001              │ 10000001 ^ 10000000      │ 00000001 (1)      │
│ -1                │ 11111111              │ 11111111 ^ 10000000      │ 01111111 (127)    │
│ 0                 │ 00000000              │ 00000000 ^ 10000000      │ 10000000 (128)    │
│ 1                 │ 00000001              │ 00000001 ^ 10000000      │ 10000001 (129)    │
│ 127               │ 01111111              │ 01111111 ^ 10000000      │ 11111111 (255)    │
└───────────────────┴───────────────────────┴──────────────────────────┴───────────────────┘
```

It maps `[-128, 127]` to `[0, 255]` without changing the relative order.

Second, in the competitive coding context, most people will do radix sorting by
comparing the decimal digits, but libc++
[compares bytes](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__algorithm/radix_sort.h#L306).

Third, radix sorting uses counting sort. The basic idea is counting the digit
occurrence and do a prefix sum, so we know the position in the sorted array
given a digit. The caveat is to maintain the stable order. If two numbers have
the same digit, their relative order should not change. The pseudocode is

```cpp
void counting_sort(vector<int>& arr, int exp) {
    int n = arr.size();
    vector<int> output(n), count(10, 0);

    // frequency prefix sum.
    for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];

    // start from the right end and decrease the frequency so we can maintain
    // stable order.
    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    arr = output;
}
```
