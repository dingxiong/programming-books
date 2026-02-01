# Fisher–Yates Shuffle Algorithm.

```cpp
void shuffle(vector<int>& vec) {
    for (int i = vec.size() - 1; i > 0; --i) {
        int j = std::rand() % (i + 1); // pick a random index from 0 to i
        std::swap(vec[i], vec[j]);
    }
}
```

Basically, it iterates from right to left and swap the current item with any
one in front including itself.

Why is this correct? Remember shuffle is the process that generates each
possible permutation of `n` elements with exactly equal probability `1/n!`.
Fisher-Yates' algorithm can be proved using induction. It is obvious true for
`n=1`. Suppose it is true for `n-1`. Then, for `n` for any permutation
`a0,a1,...,a_{n-1}`. The probability of `a_{n-1}` being the last item is `1/n`
because we use `rand() % n`. And the rest `a0` to `a_{n-2}` configuration has
probability `1/(n-1)!`. Therefore the overall probability is
`1/(n-1)! * 1/n = 1/n!`.
