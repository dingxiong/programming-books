# String

## String Append

There are many ways to append one string to the end of another string.

- `push_back`: append a single character.
- `append`: append a another string.
- `a = a + b`: create a new string. This is bad.
- `a += b`: same as append. No new string is created.

`a = a + b` is implemented
[here](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/string#L3784).
It creates a new string and copies the two strings to it. On the other hand,
`a += b` is just an alias for
[append](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/string#L1332).

Compiler cannot optimize `a = a + b` to `a += b` because it changes semantics.
Think about aliasing.
