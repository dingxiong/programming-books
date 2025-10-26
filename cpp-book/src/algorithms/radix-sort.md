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
