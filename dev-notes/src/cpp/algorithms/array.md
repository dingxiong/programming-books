# Array

## Difference Array

Codeforces has a good [blog](https://codeforces.com/blog/entry/78762) about it. 
I think in most cases, we should use `+1` to the right endpoint to simplify code.
The crucial idea is to explicitly create the diff array `vector<int> diff(n+1)`. 
Give up the idea of storing `{start/end, +/-1}` and then sort it. This is `O(NlogN)` not `O(N)`.
