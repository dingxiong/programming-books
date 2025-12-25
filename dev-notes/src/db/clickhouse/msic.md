# Miscs

## System tables

Clickhouse system table

- `system.parts` stores parts of a table if this table has a `partition by`
  clause.
- `system.zookeeper` stores paths inside zookeeper
- `system.settings` stores configuration/settings.

## JIT

Search `USE_EMBEDDED_COMPILER`.

## MergeTree

A lot of different types of merge trees share the same implementation, just
have different
[merge modes](https://github.com/ClickHouse/ClickHouse/blob/70c3f319265ceb450aa4a33b4ef131c257c76b38/src/Storages/MergeTree/MergeTreeData.h#L339).

### Replacing merge tree

`ReplacingMergeTree` can be used for upsert and delete.

TODO: figure out how `select force` performance bottleneck, and the progress.
See
https://kb.altinity.com/altinity-kb-queries-and-syntax/altinity-kb-final-clause-speed/

TODO: figure out how kafka stream works.

TODO: figure out how to bulk index data

TODO: figure out how replicatedMergeTree works.
