# class.mfct

[9.3 class.mfct](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2013/n3797.pdf)
has a sentence catches my eye.

> A member function may be defined (8.4) in its class definition, in which case
> it is an inline member function (7.1.2), or it may be defined outside of its
> class definition if it has already been declared but not defined in its class
> definition.

The second half of the above sentence means that we must explicitly declare the
function even if the function could be derived from the base class. The below
example code does not compile. We must explicitly declare `foo` in B as well.

```cpp
struct A { void foo() {}};
struct B: A {};
B::foo() {}
```

This seems very redundant, but it is rooted to C++ inheritance memory layout,
and it is especially true for virtual functions. For a derived virtual class,
the first entry in the memory layout is a pointer to its vtable, then a pointer
to its base's vtable. If we do not explicitly declare these functions in the
derived class, then it won't show up in vtable!
