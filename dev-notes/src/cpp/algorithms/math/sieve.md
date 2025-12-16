# Sieve of Eratosthenes

- Time complexity: `O(nlog(log(n))`

```cpp
int n = 10000;
std::vector<bool> is_prime(n + 1, true);
is_prime[0] = is_prime[1] = false;

for (int i = 2; i * i <= n; i++) { // check up to sqrt(n).
    if (not is_prime[i]) continue;
    for (int j = i * i; j <= n; j += i) { // start from i^2.
        is_prime[j] = false;
    }
}
```
