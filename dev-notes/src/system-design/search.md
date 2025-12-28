# Search

## Design type-ahead

When a user typed a prefix, the system should show the top K most searched
terms. There are two main problem:

1. Efficient storage layout to make search fast and not too bloated.
2. A ranking system for search result.

### Architecture

- Trie tree
  - preprocessing word tries. Assign 2 or 3 top words for each prefix => prefix
    hash tree
  - preprocessing sentence. The children are the next words shown in a
    sentence.
  - distributed Trie : sharded by prefix
- how to get user specific history + how to use trending keyword
