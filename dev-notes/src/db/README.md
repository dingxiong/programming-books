# Database

On Jan 2nd 2023, the second day of the new year, I read a post on HN about the
[year-end blog from Prof. Andy Pavlo](https://news.ycombinator.com/item?id=34220524).
It is so enlightening! I should admit that I am very interested in database
technologies for a long time, and I already started reading a book about
internals of Mysql. I am so happy to read this post which provides so much
useful information and I immediately add a 2023 goal to watch Prof. Andy's CMU
course recordings.

On resource side, SOSP is the top conference on database. Checkout their
recordings in Youtube!

## ACID

### Atomicity

Either all changes or no change. No partial changes.

### Isolation

You might have heard isolation level many times when talking to infra guys.
[Isolation wiki](<https://en.wikipedia.org/wiki/Isolation_(database_systems)>)
is the best material. Basically, there are 4 isolation levels from high to low:
`serializable`, `repeatable read`, `read committed` and `read uncommitted`.
Also, in this page, it has a link to `sanpshot isolation`. Basically, it is
stronger than `repeatable read` because it avoids `phantom reads`, but weaker
than `serializable`.

Google spanner invented another terminology `external consistency`. It is
similar to strict serializable, but with a slightly different meaning of
`happen before`. See
[this post](https://stackoverflow.com/questions/60365103/differences-between-strict-serializable-and-external-consistency).
