# Distributed Transactions

I want to keep studying subject "distributed transactions". This is a
challenging topic.

First, just put some references here

# Paper/blog posts

### [NewSQL database systems are failing to guarantee consistency, and I blame Spanner](https://dbmsmusings.blogspot.com/2018/09/newsql-database-systems-are-failing-to.html)

Prof. Daniel has a great blog about CAP theorem and the distributed DB in the
market. The comment section needs a read too!

### [Back to the Future with Relational NoSQL](https://www.infoq.com/articles/relational-nosql-fauna/)

### [Where CockroachDB and Spanner diverge](https://www.cockroachlabs.com/blog/living-without-atomic-clocks/)

This blog post discusses how CockroachDB handles distributed transactions
without TrueTime. Basically, Spanner's write performance is impacted because it
waits for uncertainty window to pass. CockroachDB on the other hand, retries
reading if there is time uncertainty, so its read performance is impacted.

# CAP theorem

# Serializability vs linearizability

These are two difference concepts. Serializability is the strictest isolation
level defined by ANSI SQL, which means two transactions T1 and T2 can be
serialized to a sequence [T1, T2] or [T2, T1].

Linearizability, on the other hand, it stricter than serializability that it
allows only one sequence order by timestamp. If T1 commits before T2 commits in
clock time, the it must be serialized to `[T1, T2]`. Because it is defined as a
point of view of an outside observer, this isolation level is called
`external consistency`. It first showed up in Google Spanner paper.

I think this post explains their differences very well
http://www.bailis.org/blog/linearizability-versus-serializability/ .

# Spanner

# Calvin

# TiDB

Post
[Keeping Time and Order in Distributed Databases](https://www.pingcap.com/blog/time-in-distributed-systems/)
describes the way how TiDB does distributed transactions.
