# File Blob Storage

Design Dropbox/Gdrive.

## Background Knowledge

### HDFS

HDFS is almost dead now. Newer applications/architectures almost all turn to
S3/GCS/ADLS. However, its internal mechanics can help us design blob storage.
The core components of HDFS are below:

- NameNode: contains metadata, such as the namespace tree and file-to-block
  mapping.
- DataNode: stores the actual data blocks. Multiple DataNodes store replicas of
  each block for fault tolerance.
- JournalNodes: used in high availability setups. When you have multiple
  NameNodes (active and standby), JournalNodes form a quorum-based storage
  system that keeps the edit logs synchronized between the NameNodes. Typically
  you run an odd number of them (like 3 or 5) for fault tolerance.
- ZKFC (ZooKeeper Failover Controller): for HA of NameNode. This is a small
  daemon that runs alongside each NameNode. It monitors the NameNode's health
  and coordinates with ZooKeeper to manage automatic failover.

You see HDFS achieve HA using a single leader architecture. Elasticsearch has
the similar design. The standby nodes are a waste of resource. In my point of
view, this design is outdated. No newer system chooses this architecture any
more.

### AWS S3

S3 is not open sourced, so I have no idea about its internal implementation.
But from the resources I collected, S3 probably had similar architecture as
HDFS in the early stage, but later was influenced by AWS Dynamo architecture,
and changed to a distributed architecture using consistent hashing. See
[post](https://geeklogbook.com/how-dynamo-reshaped-the-internal-architecture-of-amazon-s3/).

One key semantic difference between HDFS and S3 is in how they model storage:

- HDFS models a traditional filesystem, with directories, subdirectories, and
  file metadata.
- S3 models a flat key-value object store, where each object is uniquely
  identified by `(bucket, key)`. There is no true directory hierarchy;
  directories are effectively prefixes in keys. This makes S3 conceptually
  simpler and easier to scale.

To achieve HA and massive scalability, S3 employs two main mechanisms:

1. Consistent hashing:
   - Each object key is hashed to determine its placement in a distributed
     keyspace.
   - Replication factor (e.g., 3) determines multiple hash placements across
     independent nodes, ensuring redundancy.
   - Node joins or failures only affect a small portion of keys, minimizing
     data movement and avoiding a single metadata bottleneck.
2. Quorum-based replication and background repair.
   - Writes are replicated to multiple nodes and considered durable once a
     quorum acknowledges the write.
   - Continuous background processes detect failed replicas and repair them
     automatically.
   - This provides durability and availability without requiring global
     coordination for every object.

In short, S3 decouples metadata from a centralized authority, achieving HA and
scalability through distributed hashing, replication, and self-healing, whereas
HDFS relies on a central NameNode with explicit HA mechanisms.

### More Architectures

S3's architecture sounds much better than HDFS. But is it the ultimate choice?.
Many modern distributed systems use partitioned Raft clusters, such as
CockroachDB/TiKV/etcd/Spanner. Each keyspace is divided into shards/ranges (16k
for example). Each shard is replicated via Raft. Centralized meta-service
tracks shard → node mapping.

Why? Because these systems need to support scan/range queries. Hashing destroys
locality. So consistent hashing is never a choice for distributed database. But
S3 does not support range query. So key locality does not matter to it. Wait,
you may ask "hm. I use S3 daily, I can download all files belonging to a share
prefix. Then how is this possible?" This is because S3 just go to all
partitions of this bucket and filter by prefix. It is not efficient. Then you
may ask how `DynamoDB` range query works? DynamoDB is inspired by the Dynamo
paper, but I do not know the exact implementation. In `DynamoDB`, two fields
are required: `Partition Key` and `Sort Key`. You can only scan/range query
inside the same `Partition` key. In order to scan across Partition Key, you
need to explicit build a secondary index.

## Design Dropbox

The core idea is chunking and separation between metadata store and object
store.

### How does upload work?

1. Client first splits the file into chunks, and hash each chunk. No need to
   split physically, just need to scan the whole file and get the chunk hashes.
2. Client talks to Metadata service saying it is about to upload this file
   together with this chunk hashes.
3. Metadata service creates a record for this file and the associated chunk
   hashes. It also checks which chunk hashes already exit. Think that there are
   two tables. One `file` table. It records `file_name` to `check_hash`
   mapping. Another table `chunk` that stores `chunk_hash` to object store
   `uri` mapping. Metadata service only return missing chunks to the client.
4. Client uploads missing chunks directly to data nodes, and send a request to
   metadata service to update `chunk` table. There could be two approach to
   generate the upload url. Either it is generated by client side in a
   deterministic algorithm, or received from the metadata service. Later is
   better because it is more convenient for upgrade.

The main reason for this chunk based approach is dedup. The same file can be
uploaded by different users with the same or different file name.

What hashing algorithm we can use? Rolling hash is enough.

#### Any danger if two users upload the same chunk?

No. When two users upload the same chunk. The storage layer will upload them to
a temp location, and finally, atomically swap it the final destination file
path. For example Linux `mv` command. There is no danger of file corruption.
Also, uploading chunk is idempotent operation. As long as one user succeeds, it
is fine.

Because of this, user never sees partial data. The chunk file is either
non-exist or complete.

### How does download work?

1. Client requests file
2. Metadata service checks whether all chunks are uploaded already. If yes,
   returns the chunk list. If not, then return an error response.
3. Client downloads chunks in parallel.
4. Client assembles file.

### How does syncing work?

For local to remote sync, use a file watcher. For remote to local, use polling
or websocket. We may need CDC and Kafka queue here.
