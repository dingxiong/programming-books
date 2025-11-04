# Trie

Trie tree is easy to implement. See below sample code for lower case English
corps.

```cpp
struct Node {
  shared_ptr<Node> next[26];
  int val = 0;
  Node() {}
};
using NodeP = shared_ptr<Node>;

NodeP root = make_shared<Node>();

void insert(const string& word) {
  NodeP node = root;
  for (char c: word) {
    int idx = c - 'a';
    if (not node->next[idx]) node->next[idx] = make_shared<Node>();
    node = node->next[idx];
  }
  node->val = 1;
}
```

## Optimizations

The naive explicit tree structure using pointers is not cache friendly. One
optimization is to use an array to represent the tree. The `next` vector should
store the index of the next node in in the array. This was definitely not
invented by me. Checkout
[this reference](https://cp-algorithms.com/string/aho_corasick.html).

```cpp
struct Node {
  int next[26], val = 0;
  Node() { fill_n(next, 26, -1); } // very important to explicitly initialize it.
};

vector<Node> trie(1); // the first element is the root

void insert(const string& word) {
  int node = 0; // root at index 0.
  for (char c: word) {
    int idx = c - 'a';
    if (trie[node].next[idx] == -1) {
      trie[node].next[idx] = trie.size();
      trie.emplace_back(); // push the new node to the end of the array.
    }
    node = trie[node].next[idx];
  }
  trie[node].val = 1;
}
```

I asked chatgpt for more optimizations, and it suggests me that use a 2d array
`trie[n][next]` to go further with cache friendly. Too much for me!
