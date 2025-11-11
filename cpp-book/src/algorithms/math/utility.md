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
