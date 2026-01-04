# Exception

Standard exceptions are declared
[here](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/stdexcept#L79)
and defined
[here](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/src/support/runtime/stdexcept_default.ipp#L21).
The implementation uses a class `__libcpp_refstring`, which is a ref-counting
based string class. The definition is
[here](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/src/include/refstring.h#L86).
You can see the copy and copy-assign operation only increases the ref count. It
does not make a new copy.

Why? Below is the response from Gemini.

> The main reason for its existence is exception safety, particularly to handle
> the "catch-22" scenario presented by `std::bad_alloc`. When new fails, it
> throws std::bad_alloc to signal that the system is out of memory. If the
> std::bad_alloc exception object itself tried to use std::string to store its
> what() message (e.g., "memory allocation failure"), the std::string would
> also need to allocate memory. This allocation would immediately fail, causing
> the program to call std::terminate and crash before the exception could even
> be handled.
