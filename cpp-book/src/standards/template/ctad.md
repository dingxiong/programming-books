# CTAD (Class template argument deduction)

## greater<>

Many times, you can omit the type parameter in functional operators such as
`std::greater<>`. This is a new feature of C++14. See the implementation of
`std::greater`
[code1](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__functional/operations.h#L447)
and
[code2](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__functional/operations.h#L460)
for example. The trick is simple: the template parameter has a default `void`
value, and the void specialization perfectly forwards all arguments are
perfectly forward all arguments to `operator()(...)`.

See [n3421](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2012/n3421.htm)
for the motivation and why choosing this approach.

## vector v;

We do not need to write boilerplate code like
`vector<vector<int>> v(5, vector<int>(6));` any more. In C++17, we can simply
write `vector v(5, vector<int>(6));` Thanks to
[P0091R3: Template argument deduction for class templates](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2016/p0091r3.html).
