# iostream

Core class hierarchy (type system).

```
                        ios_base
                            │
                           ios
                            │
                ┌───────────┴───────────┐
                │                       │
            istream                  ostream
                │                       │
                └───────────┬───────────┘
                            │
                        iostream
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
      istringstream     ifstream           stringstream
      ostringstream     ofstream           fstream
```

Examples | Object | Type | | ------------------- | ---------- | | `std::cin` |
`istream` | | `std::cout` | `ostream` | | `std::cerr` | `ostream` | |
`std::stringstream` | `iostream` | | `std::ifstream` | `istream` |

## How does `>>` work?

`std::istream` operator `>>` is very powerful. It can parse out strings and
numerical values.

The numerical case is handled
[here](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/istream#L359).
It first initializes a `sentry __s(__is)` object. This prepares the stream for
extraction and checks if it’s already in a bad state. If the stream is already
fail or bad, `__s` evaluates to false and nothing happens. Also, `num_get` may
throw an exception if the stream could be parsed to a numerical value. Such
exception is only thrown out if `__is.exceptions() & ios_base::badbit` is
non-zero. By default, streams do not throw.

The string case is handled
[here](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/istream#L1213).
The detail is more nasty. I only want to call out this line `__str.clear();`.
It nukes the existing content of the destination string.

### Stream state

`ios_base` defines
[4 stream states](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/ios#L279)
and a few
[state query functions](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/ios#L511).

```
static const iostate badbit  = 0x1;
static const iostate eofbit  = 0x2;
static const iostate failbit = 0x4;
static const iostate goodbit = 0x0;
```

You can see `fail` means `badbit` or `failbit`, and `eofbit` is not considered
`fail`. Also, the `operator bool` function is simply
[!fail()](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/ios#L580).
How come is this true? I see a lot of code written this way:
`while (cin >> s) {...}`. If `eofbit` not considered as fail, then this loop
will continue even it reaches eof? This is because when encountering eof,
`istream` wills set both `failbit` and `eofbit`. This setup is quite wired.
These bits seem not orthogonal.

### FAQs

1. What happens if `cin >> a >> b >> c;` fails at `>> b`?

   First, the whole exception does not throw because `cin.exceptions() ==0`.
   See definition
   [std::cin definition](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/src/iostream.cpp#L59).
   Second, `a` has valid value, `b` and `c` is untouched. Finally, `cin.fail()`
   returns true in the end;
