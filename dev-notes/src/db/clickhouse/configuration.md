# Configuration

Clickhouse has a
[dedicated thread](https://github.com/ClickHouse/ClickHouse/blob/70c3f319265ceb450aa4a33b4ef131c257c76b38/src/Common/Config/ConfigReloader.cpp#L85)
watching configuration file updates. By default, it watch xml files inside
folder `/etc/clickhouse-server/`. This thread also combines all these xml files
into two xml files to

- `/var/lib/clickhouse/preprocessed_configs/config.xml`
- `/var/lib/clickhouse/preprocessed_configs/users.xml`

On top of these generated files, you can see the source files used to assembly
these generated files. See relevant code
[here](https://github.com/ClickHouse/ClickHouse/blob/70c3f319265ceb450aa4a33b4ef131c257c76b38/src/Common/Config/ConfigProcessor.cpp#L735).

Specifically for
[Clickhouse operator](https://github.com/Altinity/clickhouse-operator), we can
add configuration at `spec.configuration.settings` section. The generated file
is `/etc/clickhouse-server/config.d/chop-generated-settings.xml`. One trick is
that you can use slash to generate parent-child relation. See the
[example Kafka configuration](https://github.com/Altinity/clickhouse-operator/issues/352).

## `config.xml`

- <path>: location for data storage.

## Build configurations

```
SELECT * FROM system.build_options WHERE name LIKE 'USE%';

┌─name────────────────────┬─value─┐
│ USE_EMBEDDED_COMPILER   │ 1     │
  ...
│ USE_KRB5                │ 1     │
  ...
└─────────────────────────┴───────┘

40 rows in set. Elapsed: 0.008 sec.
```

From the result, you know
[#if USE_KRB5](https://github.com/ClickHouse/ClickHouse/blob/70c3f319265ceb450aa4a33b4ef131c257c76b38/src/Storages/Kafka/StorageKafka.cpp#L593)
evaluates to true.
