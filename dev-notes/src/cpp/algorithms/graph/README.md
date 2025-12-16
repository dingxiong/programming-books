# Tree, Graph

A tree is an undirected, connected, and acyclic graph. It has `n` nodes, `n-1`
edges and is fully connected. This setup often shows up in competitive
programming.

Realizing it is a tree is helpful for DFS because often times the graph
definition contains not only the child nodes but also the parent node. A simple
trick to skip going back is

```cpp
for (next : graph[node]):
    if (next == parent_node) continue
```
