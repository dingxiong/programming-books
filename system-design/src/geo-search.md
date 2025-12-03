# Geo Search

This is all about R-tree. The golden reference implementation is from Postgres.
I would recommend everyone read PG's
[documentation](https://www.postgresql.org/docs/current/indextypes.html).
Postgres's GiST (Generic Search Tree) provides the backbone of R-tree
implementation. The
[reference implementation](https://github.com/postgres/postgres/blob/3f9b9621766796983c37e192f73c5f8751872c18/src/backend/access/gist/gistproc.c#L7)
is easy to read, but is quite basic. In production, better turn to PostGIS —
PostgreSQL’s spatial extension.
