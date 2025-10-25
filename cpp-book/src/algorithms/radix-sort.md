# Radix Sort
libc++ has a good demonstration of the usage of radix sort.
See [code](https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__algorithm/stable_sort.h#L256).

First, it is only used if the container value type is integral. It works for int32, int64, 
etc but not floats, strings. Also, it supports negative integrals as well. 
See https://github.com/llvm/llvm-project/blob/f5f5286da3a64608b5874d70b32f955267039e1c/libcxx/include/__algorithm/radix_sort.h#L298
if you read radix_sort.h, 
