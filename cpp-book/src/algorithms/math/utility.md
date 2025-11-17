# Utility Functions

## GCD (Greatest Common Divisor) and LCM (Least Common Multiplier)

Both `std::gcd` and `std::lcm` were introduced in c++17, so most time, you do
not need to implement them by themself. However, for reference, see below
one-liner implementation for `gcd`.

```cpp
int gcd(int a, int b) { return a == 0 ? b : gcd(b%a, a); };
```

Also, in some case, we need overflow protection, we can have below `lcm`
implementation.

```cpp
using ll = long long;
ll lcm(ll a, ll b, ll limit) {
    int gcd = std::gcd(a, b);
    if (a / gcd > limit / b) return limit + 1; // return a number larger than limit indicating overflow.
    return a / gcd * b;
}
```

## Binomial Coefficients Without Overflow

I asked this question to claude.ai, and it gives me quite a few good
approaches. Here, I just list the exact Multiplicative Formula approach.

```cpp
long long binomial(int n, int k) {
    if (k > n - k) k = n - k;  // Symmetry

    long long result = 1;
    for (int i = 0; i < k; i++) {
        result = result * (n - i) / (i + 1);
    }
    return result;
}
```

You may wonder why `result * (n-i)` is divisible by `i+1`. This is because
`C(n, k+1) = C(n, k) * (n-k) / (k+1)` which is guaranteed to be divisible.

## All dividends

Not all problems require linear or `log(N)` complexity, some math problems can
have a complexity factor of `sqrt(N)`. All dividends is one of them.

```cpp
unordred_set<int> dividents(int x) {
  unordred_set<int> ans;
  for (int i = 1; i * i <= x; i++) {
    if (x % i != 0) continue;
    ans.insert(i);
    ans.insert(x/i);
  }
  return ans;
}
```

## Harmonic Series

This is related to all dividends, some math problem may have complexity
`N + N/2 + N/3 + .. + N/N`. This is called [Harmonic
Series](https://en.wikipedia.org/wiki/Harmonic_series_(mathematics) which has
complexity `log(N)`.
