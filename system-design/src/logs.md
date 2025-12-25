# Log & Metric & Tracing & Alerting

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

## Real-time Logs

## Top-k Metrics
