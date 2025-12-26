# K-V Store

## Background Knowledge

When talking about K-V stores, a lot of people especially those system design
blogs put an emphasis on consistent hashing. But in reality, I do not see any
big project uses it. Stop wasting time on it.

### Redis

Redis has 16k fixed slots, and the consensus of slots to physical nodes mapping
is achieved by a gossip protocol.

### TiKV

TiKV uses RocksDB as the underlying storage engine, and partition the key space
into many regions. Each region is a Raft group. Replication and consensus is
maintained in each region.

Meanwhile, PD (Placement Driver) maintains all metadata, such as region to node
mapping. When we split a region, PD initialize a Raft conversation with all
region leads to achieve consensus. So you can see, the region leads form a Raft
group as well.

### DynamoDB

The early version of DynamoDB might use consistent hashing, but DynamoDB
nowadays definitely does not use it.

## Read-heavy vs Write-heavy
