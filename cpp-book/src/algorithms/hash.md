# Hash

Types supported by std::hash:

- all integral types: bool, int, float, enum, etc
- `std::string`: It uses murmur hash.
- Raw pointer: hash the address. See
  [code](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__functional/hash.h#L332).

  This basically means below code `h(&a)` and `h(&b)` return different values.

  ```
  struct MyClass {};
  MyClass a;
  MyClass b;
  std::hash<MyClass*> h;
  ```

- `std::unique_ptr`: hash the address. See
  [code](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__memory/unique_ptr.h#L802).
  This is similar to raw pointer.
- `std::optional`: hash the value if present or just return zero. See
  [code](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/optional#L1278).
- `std::variant`: combine hash of the value and index. See
  [code](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/variant#L1606).
  This makes sense because union types only has one correct view. It is
  essentially the same as the backing type. But, not sure why we combine the
  index information. To distinguish the two possibilities of
  `variant<int, int>`? Wait. This is not even a valid variant.

It does not support `vector` in general, but has a specialization for
[vector<bool>](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__vector/vector_bool.h#L1095).
What the hell!

## Combine hash

For non-supported types, we need to write the hash function by ourselves. It is
usually an art of combining hashes. See below example for `std::pair`.

```cpp
class HashPair {

  template<class A, class B>
  size_t operator()(const pair<A, B>& p) const {
    return std::hash<A>{}(p.first) ^ (std::hash<B>{}(p.second) << 1);
  }
};
```

### Why `h1 ^ (h2 << 1)`?

Why XOR? Among the three simplest bit operator AND, OR and XOR, XOR's result is
evenly distributed. For example, for the 4 combinations of `0`, `1`, the XOR's
result has two `0`s and two `1`s. AND produces one `1` and three `0`s. OR
produces three `1`s, and one `0`.

Why left shift? It makes order sensitive, so `hash(a, b) != hash(b, a)`.

## How is hash requirement enforced?

Some of them uses
[\_\_enable_hash_helper](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__functional/hash.h#L537).
It requires all key types to be hashable.

Some of them put it in the destructor. See
[example](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/unordered_set#L1337).
Why?

Below is AI's response.

1.  Incomplete Types at Instantiation: When you instantiate a class template
    like std::unordered_set<MyType>, MyType can be an incomplete type at that
    point. An incomplete type is a type that has been declared but not yet
    fully defined (e.g., class MyType;). You can have pointers and references
    to incomplete types, but you can't know their size or access their members.

2.  `static_assert` Requires Complete Types: A static_assert that inspects the
    properties of a type (like checking if it's copy-constructible or if it has
    a specific function call operator) requires the type to be complete. If the
    static_assert were placed at the top of the unordered_set class definition,
    it would be checked as soon as you write std::unordered_set<MyType>. If
    MyType is incomplete at that point, the compilation would fail, even if
    MyType is defined later in the same file.

3.  Delayed Instantiation of the Destructor: The body of a class template's
    member function (including the destructor) is not instantiated until it is
    actually used or explicitly instantiated. By placing the static_assert in
    the destructor, the check is delayed until the point where an unordered_set
    object is actually destroyed. By that time, any template arguments that
    were incomplete types must have been completed.
