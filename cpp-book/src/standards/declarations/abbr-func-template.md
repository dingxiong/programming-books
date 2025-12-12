# Abbreviated function template

C++20 introduced a new syntax
[Abbreviated function template](https://en.cppreference.com/w/cpp/language/function_template.html).
The proposal is `P1141R2`. [dcl.fct#21](https://eel.is/c%2B%2Bdraft/dcl.fct#21)
provides some good examples. Basically, when you write a function parameter as
auto, the compiler automatically generates a template.

TODO: write more details about LLVM implementation.
