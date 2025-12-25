# Pinot

Pinot has a few components: `broker`, `controller`, `server`, `zookeeper` and
`minion`. See below pods after we installed pinot inside k8s.

```
$ k get pods
NAME                                     READY   STATUS    RESTARTS   AGE
pinot-broker-0                           1/1     Running   0          7d22h
pinot-controller-0                       1/1     Running   0          4d4h
pinot-minion-stateless-d5ff6f8f9-9vcts   1/1     Running   0          3d
pinot-server-0                           1/1     Running   0          7d22h
pinot-server-1                           1/1     Running   0          7d22h
pinot-zookeeper-0                        1/1     Running   0          7d21h
```

## pinot-tools

Pinot-tools is a subproject inside pinot repo, and it is the main entry to all
services inside pinot, so it depends on all other subprojects.

In the above pods, except zookeeper pod, all run the same image
`apachepinot/pinot:latest`. The docker file is
[here](https://github.com/apache/pinot/blob/e4220ecea583ff439363fd505497a3ec3cb3e4b6/docker/images/pinot/Dockerfile#L70-L70).
The entry point is `./bin/pinot-admin.sh`. Initially, I was confused because I
could not find this script inside the repo. Then I read its
[pom file](https://github.com/apache/pinot/blob/e4220ecea583ff439363fd505497a3ec3cb3e4b6/pinot-tools/pom.xml#L323-L333).
Ah! it uses [mojohaus/appassembler](https://github.com/mojohaus/appassembler)
to auto generate bash scripts. Quite a few script are generated, and
`pinot-admin.sh` is one of them. The pom file also specifies the corresponding
class for this script: `org.apache.pinot.tools.admin.PinotAdministrator`. This
Java file defines a lot of subcommands such as `StartController`, `StartBroker`
etc. OK. We learned that this is the entrance to all services and CLI tools
inside pinot.

We will talk about some important subcommands in the following sections.

### AddTableCommand

AddTableCommand is used to create a new table or update an existing table. To
create a hybrid table, we specify both `_offlineTableConfigFile` and
`_realtimeTableConfigFile`. See
[code](https://github.com/apache/pinot/blob/e4220ecea583ff439363fd505497a3ec3cb3e4b6/pinot-tools/src/main/java/org/apache/pinot/tools/admin/command/AddTableCommand.java#L240-L240).
The corresponding rest server is running inside pinot controller. The code is
[here](https://github.com/apache/pinot/blob/e4220ecea583ff439363fd505497a3ec3cb3e4b6/pinot-controller/src/main/java/org/apache/pinot/controller/api/resources/TableConfigsRestletResource.java#L166-L166).
From `validateConfig` function you can see that in order to create a hybrid
table, the table name must be the same in both offline table config and
real-time table config.

## Controller

What is running inside a controller.

```
$ ps -efww
/usr/lib/jvm/java-11-amazon-corretto/bin/java ... org.apache.pinot.tools.admin.PinotAdministrator StartController -configFileName /var/pinot/controller/config/pinot-controller.conf
```

### What runs inside a Controller

## Broker

Pinot broker is the API gateway of pinot. User's requests are received by
broker and then then routed to server using grpc.

```
$ ps -efww
/usr/lib/jvm/java-11-amazon-corretto/bin/java ... org.apache.pinot.tools.admin.PinotAdministrator StartBroker -clusterName pinot-zip -zkAddress pinot-zookeeper:2181 -configFileName /var/pinot/broker/config/pinot-broker.conf
```

## SQL query

Pinot only supports queries on a single table. It does not support table joins.
You can tell from the definition of
[PinotQuery](https://github.com/apache/pinot/blob/e4220ecea583ff439363fd505497a3ec3cb3e4b6/pinot-common/src/thrift/query.thrift#L21-L21)
class. Also, the explicit validation is
[here](https://github.com/apache/pinot/blob/e4220ecea583ff439363fd505497a3ec3cb3e4b6/pinot-broker/src/main/java/org/apache/pinot/broker/requesthandler/BaseBrokerRequestHandler.java#L328-L328).

### How query works for a hybrid table?

When a pinot broker receives a query request for a hybrid table, it will fork
this query into two queries with a boundary time filter, and then send them to
offline table and real-time table in parallel and then aggregate the two
results. For example,

```
Original query: select * from t1 where a > 100;
=>
offline table query:   select * from t1 where a > 100 and ts <= boundary_time;
real-time table query: select * from t1 where a > 100 and ts >  boundary_time;
```

There are some blogs online talking about how this boundary time is chosen by
pinot, we omit the details here. The code about how a hybrid table query is
handled
[here](https://github.com/apache/pinot/blob/e4220ecea583ff439363fd505497a3ec3cb3e4b6/pinot-broker/src/main/java/org/apache/pinot/broker/requesthandler/BaseBrokerRequestHandler.java#L421-L421).

## How does Groovy transformation work?

[Code](https://github.com/apache/pinot/blob/e4220ecea583ff439363fd505497a3ec3cb3e4b6/pinot-segment-local/src/main/java/org/apache/pinot/segment/local/function/GroovyFunctionEvaluator.java#L62-L62).
Here `genericRow` is just a map deserialized from Kafka message value (given we
use a Json decoder).
