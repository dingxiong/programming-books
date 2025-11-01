# lower_bound and upper_bound

These two functions/interfaces are very counter intuitive the first time I read
it. `lower_bound` means the position that is greater or equal than the target.
`upper_bound` means the position that is greater than the target. Actually,
`bound` means boundary. I should understand it as the half-open **equal-range
boundaries** `[lower_bound, upper_bound)`. Within this range, all elements are
equal to the target.

We have `std::lower_bound` and `map::lower_bound`. What are the differences?
The former is implemented
[here](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__algorithm/lower_bound.h#L30).
The latter is implemented
[here](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__tree#L2156).

`std::lower_bound` only requires `ForwardIterator`. The time complexity is
`O(logN)` for `RandomAccessIterator` but `O(NlogN)` for non random access
iterators because it uses `std::advance`. On the other hand, `map::lower_bound`
bisects to the left or right branch, so it is always `O(logN)`.

`std::binary_search` is just a wrapper of `std::lower_bound`. See
[code](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__algorithm/binary_search.h#L27).
It returns `__first != __last && !__comp(__value, *__first)`, i.e., a boolean
whether the target is found or not.

## Meta binary search

One interesting thing I learnt from reading libc++ code is
[meta binary search](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__algorithm/lower_bound.h#L61).
The idea is very similar to radix sort. You try out index `1xxxxx` first. If
the value at index `100...0` is larger than the target, then you to `0xxxxx`.
Otherwise, you go to the second significant bit `11xxxx`.
