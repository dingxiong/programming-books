# Z algorithm

The Z-function (or Z-algorithm) is a string processing algorithm that computes,
for each position in a string, the length of the longest substring starting at
that position which is also a prefix of the string. Given a string `s` of
length `n`, the Z-function of `s` is an array `Z` of length n where:

```
Z[i] = max k such that s[0..k-1] == s[i..i+k-1]
```

This reminds me about the longest proper prefix suffix array in KMP.

I send below prompt to claude.ai.

> could you do an animation of z-algorithm with details about the definitions
> of Z box and how it is updated?

And it generated beautiful animation and detailed explanation. Below content is
mostly copied from claude. It summarizes better than me.

## What is the Z-Box [L, R]?

The Z-box is an interval `[L, R]` representing the **rightmost** segment of the
string where:

- `s[L..R]` exactly matches `s[0..R-L]` (a prefix of the string).
- `R` is as large as possible (rightmost such segment we've found).
- It helps us avoid redundant character comparisons.

Two Main Cases:

- Case 1: `i > R` (Outside the Z-box)

  Position i is beyond our known matching segment. We must compare characters
  from scratch to compute `Z[i]`, then update the Z-box to `[i, i+Z[i]-1]`.

- Case 2: `i ≤ R` (Inside the Z-box)

  Position i falls within `[L, R]`. We use the "mirror" position `k = i - L`.
  Since `s[L..R]` matches `s[0..R-L]`, we know `s[i..R]` corresponds to
  `s[k..R-L]`.
  - Case 2a: `Z[k] < r - i + 1`

    The match at k is fully contained. Simply copy: `Z[i] = Z[k]`. Z-box
    unchanged.

  - Case 2b: `Z[k] ≥ r - i + 1`

    The match might extend beyond `R`. We know it matches up to `R`, but must
    compare beyond to see how far it extends. Update Z-box to `[i, new_R]`.

The core intuition of Z algorithm is "rightmost"! There are a few invariants.
When we process index `i`, we must have `i > L`, and `R >= L - 1`. The
`R == L - 1` case corresponds to Z value being 0. Remember we use a close range
`[L, R]`.

## Implementation

```cpp
vector<int> compute_z_array(const string& s) {
  int n = s.size();
  vector<int> Z(n); // Z[0] = 0 by tradition.

  int l = 0, r = 0; // Z-box [l, r]
  for (int i = 1; i < n; i++) {
    if (i > r) { // case 1.
      l = r = i;
      int tmp = 0;
      while (r < n and s[r] == s[tmp++]) r++;
      Z[i] = --r - l + 1; // we need --r because it goes one index beyond.
    } else { // case 2.
      // s[i..r] == s[i-l, r-l] == s[k, r-l]
      int k = i - l;
      if (Z[k] < r-i+1) Z[i] = Z[k];
      else {
        // in this case, we find a even more right range staring at i,
        // and s[i..r] == s[0, r-i], and there is potential to extend it.
        l = i;
        // node predefine tmp to r-i avoids bugs because below code updates r.
        int tmp = r-i;
        while (r < n and s[r] == s[tmp++]) r++;
        Z[i] = --r - l + 1;
      }
    }
  }
  return Z;
}
```

## Complexity

- time complexity: `O(n)`. The Z-box boundary R only moves to the right (never
  left). Each character comparison either increases R or we're done with that
  position. Since R can increase at most n times, total comparisons = `O(n)`.
