# Bit Operation

A few commonly used std functions. There are corresponding CPU instructions for
them, so it is very fast.

- `std::popcount(T x)`: Returns the number of 1 bits in the value of x.
- `std::bit_width(T x)`: the number of bits needed to store the value x.
  - MSB (most significant bit): `std::bit_width(x) - 1`.
- `std::countl_zero(T x)`.
- `std::countl_one(T x)`.

The LLVM implementation is
[here](https://github.com/llvm/llvm-project/tree/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__bit).
These functions are overkill for most cases. We can simply use a for loop to
achieve we want

```cpp
for (int i = 31; i >= 0; i--) if ((x & (1<<i)) != 0)
```
