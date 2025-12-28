# Search

## Design type-ahead

When a user typed a prefix, the system should show the top K most searched
terms. There are two main problem:

1. Speed: autocompletion should be fast. Remember, we are making suggestions
   while the user is typing. Suggestions should show up within a few
   milliseconds.
2. Efficient storage layout to make search fast and not too bloated.
3. A ranking system for search result.

### Option 1: plain mapping

Use a k-v store that maps search term to its search frequency. For example, if
user searches `amazon`, we can increment the frequency `amazon`. For
suggestion, we write a query

```
select term, count(*) where term like '<prefix>% group by term limit 5;'
```

Nobody uses it. When I type `s`, it is almost to be a full table scan because
`s` is so popular.

### Option 2: plain prefix mapping

Very similar to option 1, but we store all prefixes instead. For any user
query, we can store all its prefix to the a store. For example, if user
searches `amazon`, then we add `a`, `am`, `ama`, `amaz`, `amazo` and `amazon`.
For each term, we associated a top-k list. When doing suggestion, we can
directly search for the prefix.

This is not stupid. Checkout `chrome://predictors/`. It stores all prefixes
records in a sqlite db. This only works if you have a small dataset. In
chrome's case, it sets a upper bound for the history records.

### Option 3: Trie

This is most often cited one. But I do not like it because of the
memory/storage consumption. I do not see any serious project uses it.

- preprocessing word tries. Assign 2 or 3 top words for each prefix => prefix
  hash tree
- preprocessing sentence. The children are the next words shown in a sentence.
- distributed Trie : sharded by prefix

### Option 4: FST (Finite State Acceptor)

What is the problem with Trie? It uses huge of memory/storage. Each node can
have 26 children (assuming lower-case English letters.) The number of nodes
grows exponentially. Also, if we attach top-k results with each intermediate
nodes, then the resource usage quickly becomes prohibitive.

[Andrew Gallant's blog](https://burntsushi.net/transducers/#finite-state-machines-as-data-structures)
is a must read for this topic. Btw, he is also the author of `ripgrep`.

How FST solves the memory/storage issue? Cited from the blog.

> The only difference between a trie and the FSAs shown in this article is that
> a trie permits the sharing of prefixes between keys while an FSA permits the
> sharing of both prefixes and suffixes.

But FST comes with inconvenience during prefix searching. You cannot attach
top-k terms with intermediate nodes similar to Trie. We must traverse the
subtree to get the top-k terms. A priority queue can make it a little bit
better, but still it is too much. So what production systems do with it?

[ES/Lucene](https://www.elastic.co/blog/you-complete-me) supports type-ahead.
Internally, Lucene does not traverse the whole subtree. Instead, it sort the
arcs into buckets. When searching, it starts from the highest bucket to search
for the prefix. If found k terms in it, it is done. If not, then go to the
second highest bucket and continue. It is a coarse sorting. For example, if the
highest bucket contains 100 terms starting with this prefix, then top-5 query
can return randomly 5 of these 100 terms. Check the
[Lucene's source code](https://github.com/apache/lucene/blob/2ad2530ecd9178265149ba5555145f71080a2a92/lucene/suggest/src/java/org/apache/lucene/search/suggest/fst/FSTCompletionLookup.java#L66-L66)
for more details.

### Filter inappropriate suggestions

### how to get user specific history

### how to use trending keyword
