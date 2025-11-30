# Fermat's Little Theorem

[Fermat's little theorem](https://en.wikipedia.org/wiki/Fermat%27s_little_theorem)
states that \\[ a^{p-1} \equiv 1 \pmod{p} \quad \text{if $p$ is prime and $a$
is coprime to $p$.} \\]

`Coprime` means the only positive integer that is a divisor of both of `a` and
`p` is 1. Since `p` is a prime, this means as long as `a` is smaller than p,
then they are coprimes. In most competitive programming, `p` is super large
number like `1e9 + 7`, so the coprime condition is valid.

## Applications

One common application in competitive programming is evaluating modulo of
fraction numbers.

\\[ \frac{x}{a} \equiv \frac{x\cdot a^{p-2}}{a \cdot a^{p-2}} \equiv x \cdot
a^{p-2} \pmod{p} \\]

### Example: Multinomial Coefficient

```cpp
long fact[100'001];
int mod = 1e9 + 7;

long modpow(long x, int n) {
  if (n == 0) return 1;
  long h = modpow(x, n/2);
  return h * h % mod * (n%2==1 ? x : 1) % mod;
}

// Calculate multinomial coefficient n!/(n1! * n2! * ...)
// where n = n1 + n2 + ...
long multinomial(const vector<int>& ns) {
    int n = accumulate(ns.begin(), ns.end(), 0);
    fact[0] = 1;
    for (int i = 1; i <= n; i++) {
        fact[i] = i * fact[i-1] % mod;
    }
    long ans = fact[n];
    for (int ni : ns) {
        ans = ans * modpow(fact[ni], mod-2) % mod;
    }
    return ans;
}
```
