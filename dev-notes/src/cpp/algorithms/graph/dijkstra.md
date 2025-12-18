# Dijkstra

Dijkstra works for both directed and undirected graphs. Below is my favorite
implementation.

```cpp
// a graph with nodes 0, 1, ,, n-1.
// graph[i] is node i's neighbors and the corresponding distance/cost.
vector<int> shortest_distance(int from, const vector<vector<pii>>& graph) {
  int n = graph.size();
  vector<int> ds(n, INT_MAX); ds[from] = 0;

  auto comp = [&ds](int a, int b) {
      if (ds[a] != ds[b]) return ds[a] < ds[b];
      return a < b;
  };
  set<int, decltype(comp)> q(comp);
  for (int i = 0; i < n; i++) q.insert(i);

  while(q.size()) {
      int idx = *q.begin(); q.erase(q.begin());
      if (ds[idx] == INT_MAX)
          return ds; // we cannot reach remaining nodes, so we can return early.
      for (const auto& [next, cost] : graph[idx]) {
          int newc = ds[idx] + cost;
          if (newc < ds[next]) {
              q.erase(next);
              ds[next] = newc;
              q.insert(next);
          }
      }
  }
  return ds;
}
```

A few notes:

1. Why use `set` instead of `priority_queue`? This is because the same vertex
   can be relaxed multiple times. Priority queue can process the same node
   unnecessarily.
2. When updating (i.e. remove + insert) a set element, remove first, and then
   update distance value.
3. When you see `ds[idx] == INT_MAX` when working on the queue, then it mean
   you encounter a node that is not accessible from the source node. The rest
   nodes were not accessible either. It is time to stop the algorithm.
4. The `while` loop executes exactly `n` times if all nodes are accessible, and
   less than `n` times if we abort early. This is because in each iteration we
   pop out one vertex.

## Time complexity

The time complexity of above implementation is `(E+V)*logE`. Different
implementation can have different complexity.

- `E*logE` comes from two parts. We insert `0:n` to the `set`, The inside the
  loop, we pop out the beginning element.
- `V*logE` comes from the relaxing stage. The `erase` and `insert` operation
  takes `logE` time, and we can have at most `V` relaxations. Each edge can be
  used at most once to relax a vertex.

It seems we can further simplify the expression to `V*logE`, but that is only
valid for dense graph. For a sparse graph `E` is much smaller than `V`, so in
general case, we do not know which one is larger. Then it is better to have
both.

## Shortest Path

If you need the shortest path as well, you can simply update the parent
information whenever relaxation happens.

## Array implementation variant

[cp-algorithms](https://cp-algorithms.com/graph/dijkstra.html) has a different
implementation which has time complexity `E^2`. It is better than the heap
implementation above for dense graph.
