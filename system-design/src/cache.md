# Caching

Typical numbers

- Redis latency: 1 microsecond.
-

## Consistent Caching.

## CRDT (Conflict-free replicated data type)

Redis enterprise and AWS MemoryDB supports it.

## Caching cluster

Redis does not use Raft, but a gossip protocol to promote master node when
master node is down. It requires we set up replica nodes.
