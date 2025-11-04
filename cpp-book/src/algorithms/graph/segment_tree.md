# Segment Tree

A few conventions to reduce chances of mistakes.

1. left branch is `[l, m]`, right branch is `[m+1, r]`. This avoids the index
   of out of range error for the middle point `(l+r)/2`.

Below is the naive implementation using explicit tree node.

<details class="code-details">
<summary> struct Node; </summary>

```cpp
struct Node {
    int l, r;
    shared_ptr<Node> left, right;
    int s; // each node stores the sum of the range [l,r].
    Node(int l, int r): l(l), r(r), s(0) {}
};
using NodeP = shared_ptr<Node>;

NodeP root;

void create_children(NodeP node) {
     if (node->l != node->r) {
        int m = (node->l + node->r) / 2;
        if (not node->left) node->left = make_shared<Node>(node->l, m);
        if (not node->right) node->right = make_shared<Node>(m+1, node->r);
    }
}

int query(NodeP node, int l, int r) {
    int m = (node->l + node->r) / 2;
    create_children(node);
    if (node->l == l and node->r == r) {
        return node->s;
    }

    if (r <= m) return search(node->left, l, r);
    else if (l > m) return search(node->right, l, r);
    else return search(node->left, l, m) + search(node->right, m+1, r);
}

// Add val to the existing value at node i.
void update(NodeP node, int i, int val) {
  create_children();
  node->s += val;
  if (node->l == i and node->r == i) return;
  int m = (node->l + node->r) / 2;
  if (i <= m) update(node->left, i, val);
  else update(node->right, i, val);
}
```

</details>

Most segment tree code you see online uses an array to represent the tree. See
[example](https://www.hackerearth.com/practice/notes/segment-tree-and-lazy-propagation/).
An array `int tree[2n+1]` represent a tree with `n` nodes. `tree[k]` has
children `tree[2k]` and `tree[2k+1]`. Root node is `tree[1]`. However, I do not
like this implementation because it makes the interface more verbose. In my
implementation, `struct Node` contains the boundary information `l` and `r`.
With the array approach, the interface becomes
`int query(int node, int start, int end, int l, int r)`. The first 3 parameters
are the node index, left and right boundary.

## Lazy Propagation

The basic search and update operation has `O(logN)` complexity. It is not
efficient for range update. To make it `O(logN)` as well, we need lazy
propagation. A new helper `push` introduced. It realized the laziness at the
current node, and push the laziness down to its children. There are four places
we need `push`. First, at the beginning of a query, which is obvious. Then 3
places in `update`:

1. At the beginning of `update`.
2. At the base condition, i.e., query range equals node's boundary. This is
   where the performance improvement comes from. It avoids going deep to leaf
   nodes, and simply put a marker in the current node saying: all nodes under
   this subtree have an un-realized update amount `inc_amount`.
3. Before we finally update current node's value. This is pre-order traversal.
   We need to make sure the left and right children do not have any lazy value
   before we add them up. Otherwise, it would be wrong. This is most popular
   mistake I made!

<details class="code-details">
<summary> Lazy Propagation </summary>

```cpp
struct Node {
    int l, r;
    shared_ptr<Node> left, right;
    int lazy = 0; // lazy update amount
    int s;
    Node(int l, int r): l(l), r(r), s(0) {}
};
using NodeP = shared_ptr<Node>;

NodeP root;

void create_children(NodeP node) {
     if (node->l != node->r) {
        int m = (node->l + node->r) / 2;
        if (not node->left) node->left = make_shared<Node>(node->l, m);
        if (not node->right) node->right = make_shared<Node>(m+1, node->r);
    }
}

// realize laziness at current node and push it down the tree.
void push(NodeP node) {
    if (node->lazy) {
        node->s += node->lazy * (node->r - node->l + 1);
        // only push down when it is not a leaf node.
        if (node->l != node->r) {
            node->left->lazy += node->lazy;
            node->right->lazy += node->lazy;
        }
        // remember to reset laziness.
        node->lazy = 0;
    }
}

int query(NodeP node, int l, int r) {
    int m = (node->l + node->r) / 2;
    create_children(node);
    // realize laziness before query.
    push(node);
    if (node->l == l and node->r == r) {
        return node->s;
    }

    if (r <= m) return search(node->left, l, r);
    else if (l > m) return search(node->right, l, r);
    else return search(node->left, l, m) + search(node->right, m+1, r);
}

void update(NodeP node, int l, int r, int inc_amount) {
    int m = (node->l + node->r) / 2;
    create_children(node);
    push(node);

    if (node->l == l and node->r == r) {
        node->lazy += inc_amount;
        push(node);
        return;
    }
    if (r <= m) {
        insert(node->left, l, r);
    } else if (l > m) {
        insert(node->right, l, r);
    } else {
        insert(node->left, l, m);
        insert(node->right, m+1, r);
    }
    // make sure left and right do not have un-realized updates.
    push(node->left); push(node->right);
    node->s = node->left->s + node->right->s;
}
```

</details>
