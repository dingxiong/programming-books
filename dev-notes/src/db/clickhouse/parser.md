# parser

## ParserCreateQuery

`CREATE TABLE ...` queries supports `partition by`, `group by`, `ttl` and etc.
How does this DDL string is parsed? The source code is
[here](https://github.com/ClickHouse/ClickHouse/blob/70c3f319265ceb450aa4a33b4ef131c257c76b38/src/Parsers/ParserCreateQuery.cpp#L423).
The result is a
[ASTStorage](https://github.com/ClickHouse/ClickHouse/blob/70c3f319265ceb450aa4a33b4ef131c257c76b38/src/Parsers/ASTCreateQuery.h#L17).

## Kafka engine parameters

Source code is
[here](https://github.com/ClickHouse/ClickHouse/blob/70c3f319265ceb450aa4a33b4ef131c257c76b38/src/Storages/Kafka/StorageKafka.cpp#L889).
