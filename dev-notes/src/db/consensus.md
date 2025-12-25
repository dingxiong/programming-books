# Consensus

A cluster needs coordination sometimes. Agents or nodes inside this cluster
need to reach consensus before manipulating some critical data, usually meta
data about this system.

> TODO: write a better summary about distributed consensus.

FLP result says that achieving distributed consensus is impossible in the most
general case. Also, distributed consensus is equivalent to atomic broadcast.
You can read more about this from
[wikipedia](https://en.wikipedia.org/wiki/Atomic_broadcast).

The most popular consensus protocol is Paxos protocol and its variants, among
which Zookeeper and Etcd are the nominating choices in the current market. Some
companies are building alternatives too, such as
[ClickHouse Keeper](https://clickhouse.com/docs/en/operations/clickhouse-keeper/).
Here is a good paper about this topic:
[Consensus in the Cloud: Paxos Systems Demystified](https://cse.buffalo.edu/tech-reports/2016-02.orig.pdf).

## Zookeeper

Zookeeper's consensus protocol `Zab` (Zookeeper atomic broadcast) is a variant
of Paxos protocol. The best description of `Zab` is probably this paper:
[ZooKeeper’s atomic broadcast protocol: Theory and practice](http://www.tcs.hut.fi/Studies/T-79.5001/reports/2012-deSouzaMedeiros.pdf)
by Andre Medeiros from 2012.

## Etcd

Etcd implements RAFT algorithm. RAFT is designed for understandability. See the
original paper
[In Search of an Understandable Consensus Algorithm (Extended Version)](https://raft.github.io/raft.pdf).
