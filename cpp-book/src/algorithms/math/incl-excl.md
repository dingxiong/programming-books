# Inclusion-Exclusion Principle

The problem statement:

```
Goal: Count elements in A₁ ∪ A₂ ∪ ... ∪ Aₙ

Formula: |A₁ ∪ ... ∪ Aₙ| =
  Σ(single sets) - Σ(pairs) + Σ(triples) - ... + (-1)^(n+1) Σ(all n)
```

This formula looks daunting in the first appearance. How could you enumerate
all these combinations? It is definitely extremely hard in the general case.
However, in competitive programming context, `n` is usually less than `32`, so
we can use bit mask to enumerate the set. The pseudocode is what follows.

```cpp
// Input: vector<int> A => represent the array we need apply some count on it.

int n = A.size();
int total = 0;

for (int mask = 1; mask < (1<<n); mask++) {
    int bits = 0; // number of element in the set.
    for (int i = 0; i < n; i++) {
        if ((1<<i) & mask) {
            // A[i] is chosen, do the counting here.
            ...

            // Also, do not forget count included elements.
            bits++;
        }
    }
    cout == ... // business logic related

    // Inclusion-exclusion: odd size adds, even size subtracts
    if (bits % 2 == 1) {
        total += count;
    } else {
        total -= count;
    }
}
```
