# Binary Lifting

Binary lifting is an algorithmic technique primarily used in trees to
efficiently answer queries related to ancestors, such as finding the `K-th`
ancestor of a node or the Lowest Common Ancestor (LCA) of two nodes. It
leverages dynamic programming and the binary representation of numbers to
achieve logarithmic time complexity for queries after an initial preprocessing
step.

The central idea is to precompute and store the ancestors of each node at
specific powers of two. For a node `u`, we store its `2^0`-th ancestor (its
direct parent), its `2^1`-th ancestor (its grandparent), its `2^2`-th ancestor,
and so on, up to the `2^k`-th ancestor where `2^k` is approximately equal to
the height of the tree. This information is typically stored in a 2D array, say
`up[node][k]`, which represents the `2^k`-th ancestor of node.

Use cases:

1. kth ancestor.
2. Least Common Ancestor (LCA).
3. Path aggregates using binary lifting.

```cpp
using vi = vector<int>;

vector<vi> up;
int LOG;

build_power2_ancestors(int n, vector<int>& parent) {
    LOG = ceil(log2(n)) + 1;
    up.resize(LOG, vi(n, -1));

    for (int i = 0; i < n; i++) up[0][i] = parent[i];
    for (int p = 1; p < dep; p++) {
        for (int i = 0; i < n; i++) {
            int a = up[p-1][i];
            if (a == -1) up[p][i] = -1;
            else up[p][i] = up[p-1][a];
        }
    }
}

int kth_ancestor(int node, int k) {
    for (int i = LOG-1; i >= 0; i--) {
        if ((k & (1<<i)) == 0) continue;
        if (i > up.size()-1) return -1;
        node = up[i][node];
        if (node == -1) return -1;
    }
    return node;
}

int lca(int u, int v) {
   // Make u the deeper node
   if (depth[u] < depth[v]) swap(u, v);

   // Bring u to the same level as v
   int diff = depth[u] - depth[v];
   u = kth_ancestor(u, diff);

   // If u and v are the same after leveling
   if (u == v) return u;

   // Binary search for LCA
   for (int j = LOG - 1; j >= 0; j--) {
       if (up[j][u] != up[j][v]) {
           u = up[j][u];
           v = up[j][v];
       }
   }

   return up[0][u];
}
```
