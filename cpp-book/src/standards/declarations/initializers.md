# Initializers

Initialization in C++ is complicated. See
[C++ standard](https://eel.is/c++draft/dcl.init). If you believe you are an
expert in this area, then please answer the below questions.

1. For `int arr[5];`, are all 5 elements initialized to zero?
2. How about `int arr[5] = {};`?
3. How about `int arr[5] = {1};`?
4. For `vector<int> v(5);`, are all 5 elements initialized to zero?
5. How about `vector<pair<int, int>> v(5);`?

We need to cover at least concepts: `default initialization`,
`zero initialization` and `value initialization`.

## Value Initialization

[dcl.init#general-9](https://eel.is/c++draft/dcl.init#general-9) covers value
initialization. It covers 3 cases: class type, array type and others.

### Others

Let's see the others' case. The standard draft says

> Otherwise, the object is zero-initialized.

Also, the zero initialization sections says

> if T is any other scalar type, the object is initialized to the value
> obtained by converting the integer literal 0 (zero) to T;

So for `int`, `float` etc. value initialization means setting to zero. For
example, `float x {};` explicitly sets `x` to `0`. While `float x;` is default
initialization. How is a primitive default initialized? Section `general-7.4`
says no initialization is performed, which mean it is random, i.e., any garbage
value at that stack location.

So remember: **scalar type value-initialization is zero-initialization**.

### Class type

If `T` is a class type, and if it has a user-provided constructor, then it this
constructor is used. If no such constructor, then it is zero initialized.
**After that, the object is then default initialized.**

For example, a simple class as below

```cpp
struct A {
  int x, y;
  A(int y): y(y) {}
};

A a(5);
```

It has a user-provided constructor. It is first called, so `y` is initialized
to `5`. How about `x`? It is default initialized and thus a random value. If we
change `int x, y;` to `int x = 0; int y;`, then it is default to zero.

Let's see another case `vecotr<int> v(5);`. The vector self is
value-initialized. How about its elements? cppconference.com says "Constructs a
vector with count default-inserted objects of T. No copies are made." What does
`default-inserted` means? The standard section
[container.requirements#container.alloc.reqmts-2.2](https://eel.is/c++draft/container.requirements#container.alloc.reqmts-2.2)
says

```
An element of X is default-inserted if it is initialized by evaluation of the
expression `allocator_traits<A>::construct(m, p)`.
```

I checked the libc++ implementation. The final piece is this
[construct_at](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__memory/construct_at.h#L38)
function. It basically says

```
return ::new (static_cast<void*>(__location)) _Tp(std::forward<_Args>(__args)...);
```

For this vector example, `__args` is empty, thus it is simplified to
`::new in();`. You can test it out[^note1], this is value initialization!
Therefore, `vector<int> v(5);` initializes all elements to zero.

Not just for `int`, it applies to `vector<pair<int, int>>` and
`vector<tuple<int, float>>` as well. The default constructor of `pair` and
`tuple` both value-initializes all elements. It is explicitly written in
cppconference.com.

### Array type.

Lastly, if `T` is an array type, then all its elements are value initialized.
Let's analyze three cases:

- `int arr[5];`: default initialization. These 5 elements are random.
- `int arr[5] = {};`: value initialization. Each element is value initialized.
  As said above, each one is zero-initialized. So this is equivalent to
  `int arr[5] = {0, 0, 0, 0, 0};`;
- `int arr[5] = {1, 2};`: value initialization.
  [dcl.init#general-16.5](https://eel.is/c++draft/dcl.init#general-16.5) has a
  special paragraph for this case. Basically, element `e_i` is copy initialized
  for `1 <= i <= k` and remaining elements are value-initialized. so this is
  equivalent to `int arr[5] = {1, 2, 0, 0, 0};`.

## Answers to the questions at the beginning.

1. No. The elements are random because `arr` is default initialized.
2. Yes. All zeros because `arr` is value initialized.
3. The first element is `1`. The rest is `0`.
4. Yes. All zeros;
5. Yes. All pairs have zero first and zero second parts.

[^note1]:
    Please do exactly as `int *p = new int();` because `int a();` won't give
    what you want. Checkout "most vexing parse".
