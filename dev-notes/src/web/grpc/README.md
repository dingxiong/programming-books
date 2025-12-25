# grpc

## Plugin

Quote from
[plugin.proto](https://github.com/protocolbuffers/protobuf/blob/main/src/google/protobuf/compiler/plugin.proto):

```
// protoc (aka the Protocol Compiler) can be extended via plugins.  A plugin is
// just a program that reads a CodeGeneratorRequest from stdin and writes a
// CodeGeneratorResponse to stdout.
//
// Plugins written using C++ can use google/protobuf/compiler/plugin.h instead
// of dealing with the raw protocol defined here.
//
// A plugin executable needs only to be placed somewhere in the path.  The
// plugin should be named "protoc-gen-$NAME", and will then be used when the
// flag "--${NAME}_out" is passed to protoc.
```

## Example study: python-betterproto

[python-betterproto](https://github.com/danielgtaylor/python-betterproto) is a
proto plugin that generates better, typed python code. The main entry is
[here](https://github.com/danielgtaylor/python-betterproto/blob/098989e9e93c97e16e10257b1b3575f987180f8c/src/betterproto/plugin/main.py#L14)
and it uses
[a template](https://github.com/danielgtaylor/python-betterproto/blob/098989e9e93c97e16e10257b1b3575f987180f8c/src/betterproto/templates/template.py.j2#L76)
to generate the output python code. Checkout the
[models](https://github.com/danielgtaylor/python-betterproto/blob/098989e9e93c97e16e10257b1b3575f987180f8c/src/betterproto/plugin/models.py#L403)
file to see how the types are generated and injected to the Jinja2 template.

## Binary protocol

The [official doc](https://protobuf.dev/programming-guides/encoding/) describes
the binary protocol in depth. The variable-width integer format is quite
interesting. The `python-betterproto` repo has a
[python implementation](https://github.com/danielgtaylor/python-betterproto/blob/098989e9e93c97e16e10257b1b3575f987180f8c/src/betterproto/__init__.py#L346)
of this protocol. Among the few binary encodings I have seen so far, protobuf
has the concisest format, but it only supports a small subset of data
structures. For example, it does not have built-in hashset type. According to
[the protobuf official team](https://github.com/protocolbuffers/protobuf/issues/3432),
supporting hashmap and hashset is "complicated" and hard to maintain :(. I do
not understand this statement. I probably do not appreciate the difficulty of
maintaining the backward and forward compatibility inside protobuf. On the
other hand, Kafka's binary protobuf is more verbose, but is more expressive.
