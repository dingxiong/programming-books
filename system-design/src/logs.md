# Log & Metric & Tracing & Alerting

## Real-time Logs

We need to distinguish two different use cases. One is audit logs from
customers. The other is server logs used internally by your company's
engineers/supports.

The first case is also call "user journey logs". They are as important as
business itself. For example, if your business deals with payment, then legal
or security requires all user's actions such as editing an invoice, money
transfer are all logged for future audit purpose. Not only for audit
requirement, it is beneficial for customers' own benefits sometimes. For the
case, we need treat these audit logs as important as business data. So it is
best store them in durable storage and even wrap them in the same transaction
as business flow.

The second case is internal logs. They are used for debugging purpose mostly.
In this case, ELK is the standard. We also need Kafka queue between collector
and sinker as a buffer. I built an ELK pipeline from before.

- Log collector: vector.dev or filebeat. It tails the log files, sand send them
  to the next stage.
- Kafka: log message broker
- Logstash: Some transformations done here. This step actually could be removed
  because Kafka can directly dump to ES.
- Sink: ES. I set up 8 ES pods each with 8T PVC, and it uses 70% of the
  storage.
- UI: Kibana.

### How does it scale?

Elasticsearch support datastream. It automatically generates a new index when
the current index size reaches a threshold value. All these indices are
suffixed by timestamp, and blong to the same datastream. The scalability comes
from the number of concurrent indices used for indexing. For example, suppose
you have 4 ES data nodes, then you can create 4 datastreams `ds-1` to `ds-4`,
and on the Kafka/Logstash side, you can alternately write to all 4 datastreams.
Therefore, all ES nodes are kept busy and we can scale.

## Metrics

Metric data seems similar to logs, but they are quite different.

### Pull vs Push

For logs, we never need to discuss pull vs push because it is just a local
agent tailing a log file. Metrics collectors, however, can choose between pull
or push mode. Usually both modes are used. Pull mode works well for system
metrics such as CPU, memory usage. Datadog customized metrics work this way,
you register a new metric and the agent will pull the metric every 10 seconds.
On the other hand, push mode requires client side's instrumentation. For
example, you can use `dd-trace` python package to manually send metrics.

For performance purpose, push mode does not directly pushes the metrics to
remote server. There is usually a local agent accepts these metrics and does
some aggregation before sending to the remote backend. This is how Datadog
agent metric component works.

Metrics are similar to logs, but there is one big difference: aggregation. For
logs, we have no choice, but just dump them all. For metrics, we can usually
apply some aggregation on the collector side. It saves bandwidth.

### Top-k Metrics

Add a consumer for the metrics stream. It updates a Redis cache to maintain the
top-k stats. Redis with AOF is good enough for durability.

## Distributed Tracing

First, distributed tracking refers to the tracking of traffic/requests across
all the different services and components, giving you a clear picture of what's
happening in a large picture.

Second, tracing involves two sides: client side and server side. Client side's
responsibility is in
