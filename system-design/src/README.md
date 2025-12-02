# Introduction

- Reliability: fault-tolerant, resilient.

Terms

- Polyglot Persistence: the practice of using multiple database technologies
  within a single application to handle different types of data and workloads
  more effectively
- Normalization: the process of organizing data to reduce redundancy and
  improve data integrity, often by splitting it into multiple related tables.
  Denormalization is the opposite process.

## B-Tree

B-Tree:

- Every node stores keys and values. Leaves are at the same depth, but values
  can appear in internal nodes too.

B+ Tree:

- Internal nodes: only keys
- Leaves: keys + values/record pointers
- Leaves are linked as a sorted linked list → efficient range scans
- Because internal nodes store only keys, they pack more per page → higher
  fan-out → shorter height

This is why almost all databases (PostgreSQL, MySQL/InnoDB, SQLite),
filesystems, and storage engines use B+ Trees, not plain B-Trees.
