# Real-time Marketplace

Design Uber/Lyft/Doordash/Yelp.

## Background knowledge

### Redis GEO

Redis provides a set of GEO commands: `geoadd`, `geosearch` etc. The core idea
is `geohash`.

Redis GEO encodes latitude and longitude into a geohash integer and stores it
as the score of a sorted set. Radius queries are implemented as multiple
sorted-set range scans over neighboring geohash cells, followed by exact
distance filtering. This avoids complex spatial indexes and keeps writes
extremely cheap, which is ideal for high-frequency location updates.

[Wikipedia](https://en.wikipedia.org/wiki/Geohash) has vivid example of how
this hash is constructed. `Redis`'s implementation is mainly inside the
[geo.c](https://github.com/redis/redis/blob/238a62685954b1128c25d7f60c326fd20b2cd9ea/src/geo.c#L365)
file.

### Postgres

This is all about R-tree. The golden reference implementation is from Postgres.
I would recommend everyone read PG's
[documentation](https://www.postgresql.org/docs/current/indextypes.html).
Postgres's GiST (Generic Search Tree) provides the backbone of R-tree
implementation. The
[reference implementation](https://github.com/postgres/postgres/blob/3f9b9621766796983c37e192f73c5f8751872c18/src/backend/access/gist/gistproc.c#L7)
is easy to read. It defines functions to check whether two boxes intersects,
the distance between two boxes, and etc. But overall it is quite basic. In
production, better turn to PostGIS (PostgreSQL’s spatial extension).

## Design Uber

### Traffic estimation

First, estimate the traffic. AI is really good at this part. Here I just copy
the response from chatgpt.

For a large city with 10m citizens, suppose 30% of them are registered Uber
users. Each registered user takes 1/3 ride per day on average. Then it is 1m
rides per day. These rides are not evenly distributed over 24 hours. For
example, there is almost no ride from 1am to 5am. Let's assume 80% rides happen
during peak hour (4h). That is `1m * 0.8/4 = 200k` rides/hour.

How many concurrent drivers? Suppose each ride takes 20min, which means each
driver can finish 3 rides per hour. So `200k/3 = 67k` concurrent drivers.

How many concurrent riders? Let's assume most riders only use Uber for
searching, after ride is confirmed, they swipes away to other apps. There are
definitely some riders leaving Uber open for the whole trip, such as me, but it
is rare. With this assumption, we can assume each rider uses 5min for each
ride. So `200k/60*5 = 16.7k` concurrent riders.

So the heavy part is on the driver side. Now suppose driver reports GPS
location every 3 seconds, then it means `67k/3=22k` writes/seconds.

Read traffic is more complicated. Rider needs to poll trip status update, fetch
nearly drivers, etc. Drivers need to poll route/trip updates etc. Let's assume
the poll frequency is 1 second, the we expect 3x-5x read traffic than write
traffic.

So in summary,

- write: 20k QPS
- read: 60k QPS

### Rider driver matching

Matching is a multi-stage pipeline: geo filtering using Redis GEO, hard
constraint filtering, heuristic scoring based on ETA and fairness, atomic
reservation to prevent double assignment, and sequential dispatch to drivers
with timeouts. The system is optimized for low latency and high write
throughput rather than perfect global optimality.

1. Rider sends a request to Uber
   `(rider_id, pickup_lat, pickup_lon, vehicle_type)`.
2. Matching service looks up nearby drivers
   `GEORADIUS drivers pickup_lon pickup_lat 2 km`.
3. Filter by hard constraint.
   - driver.status == AVAILABLE
   - no tentative lock on the driver.
   - vehicle_type == requested
4. Score drivers. `score = f(ETA, cancellation_risk, driver fairness, ...)`
5. Tentative reservation. Add a lock key with 10s TTL.
6. Send the offer to driver.
7. Driver accepts the offer => `driver.status = BOOKED`.

   Driver declines the offer => `driver.status = AVAILABLE` and delete the
   lock.

8. Send the update to Driver. Processing payment staff, etc.
