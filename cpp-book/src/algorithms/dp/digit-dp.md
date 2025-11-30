# Digit DP

Problem statement:

```
Count the number of integer say ‘x’ in the range [a, b]
such that x satisfies some conditions related to digits.
```

[cf blog](https://codeforces.com/blog/entry/53960) is a good introduction with
intuition. But I do not like the top-down recursive code it provides. I am more
interested in the bottom-up solution with clear base condition and recursion
formula.

Let's define function `int calc(int num);` returns the satisfied integers in
range `[1, num]`, then the answer is `calc(b) - calc(a-1)`. Sometimes, it is
not trivial to calculate `a-1`. We can have a small trick in the dp process to
account for the inclusiveness. So the function interface becomes
`int cal(int num, bool inclusive);`

The core part of digit dp is the concept of "tightness". Let's assume

```
n: the total number of digits of intger num.
d0, d1, d_{n-1}: num's digits from left to right.
```

Then define

```
dp[pos][k][tight]:
    Assume digits at position [0, pos-1] are all known,
    then the count for valid configurations up to `pos`.

---
pos: 0, 1, 2, ..., n

k: probelm related attribute/constraint. For example,
  - If the constraint is that the number has fixed number of odd digits,
    then k is the total odd digits in position [0, pos-1]
  - If the constraint is that adjencent digit are different, then k is the
    previous digit.

tight: boolean -> digits in position [0, pos-1] are not tight or not.
```

## Recursion formula

<!-- prettier-ignore-start -->
\\[ 
dp[pos][k][tight] = \sum_{i = 0}^{i \le up} dp[pos+1][k^{\prime}][tight^{\prime}]
\\]
<!-- prettier-ignore-end -->

Here `up = tight ? d_pos : 9`. Basically, it means at position `pos`, you can
use digit `0`, `1`, ..., `up`. And the new tight is determined by existing
tight and the digit chosen, i.e., `new_tight = tight == 0 or i < up ? 0 : 1;`.

## Base condition

We initialize dp matrix as `dp[n+1][max_k][2]`. Why `n+1`? As said,
`dp[n][k][tight]` means the first `n` digits `[0, n-1]` are all fixed. So we
have base conditions.

```
dp[n][valid k][0] = 1;

# The base tight case is equivalent to say num is counted or not.
dp[n][valid k][1] = inclusive ? 1 : 0;
```

## Variations

So far, we have assumed that the integer constraint has no relation with the
leading zero digits. For example, if the constraint is the total number of odd
digit should be fixed, then in this case `005` and `05` has the same odd digit
count. What if the constraint is the number of even digit. Then in the
recursion formula, when you choose `0` for the current digit, do you add it to
the event digit count? It depends whether this digit belongs to the leading
zero digits or not.

In this case, we introduce a new boolean dimension `started`:
`dp[pos][k][tight][started]`. The recursive formula for this dimension is

```
new_started = started or (digit > 0)
```
