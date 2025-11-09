# Union-Find

Read below beautiful one-liner implementation of the `find` function.

```cpp

vector<int> p; // fathers or parents
vector<int> ss; // size of each joint group.

int find(int i) {
    /*
    * If it itself is root, just return. If not, then find its real parent.
    * This part contains path compression because of the recursive call to
    * the `find` function.
    */
    return p[i] == i ? i : p[i] = find(p[i]);
}

void join(int i, int j, int cost) {
    int pi = find(i), pj = find(j);

    // this check is important. Otherwise, it updates group size which is wrong.
    if (pi != pj) {
        // Union by rank optimization - attaches smaller tree under larger one.
        if (ss[i] > ss[j]) swap(pi, pj);
        p[pi] = pj;
        ss[pj] += ss[pi];
    }
}
```

## Applications

### Cycle detection

We can make the `join` function to return a boolean indicating the two nodes
are already joined or not. This trick can detect cycles in a graph.

### Minimal Spanning Tree

A minimum spanning tree (MST) or minimum weight spanning tree is a subset of
the edges of a connected, edge-weighted undirected graph that connects all the
vertices together, without any cycles and with the minimum possible total edge
weight.

Kruskal's algorithm uses Union-Find algorithm.

```cpp
vector<array<int,3>> edges; // {weight, u, v}

// step 1: sort by weight
sort(edges.begin(), edges.end());


// step 2: Try to add each edge in order
// Here, we make a small change to the `join` function. It returns true if
// join happens, false if the two nodes are already joined.
long long mst = 0;
for (auto [w, u, v] : edges) {
    if (join(u, v)) mst += w;
}
```
