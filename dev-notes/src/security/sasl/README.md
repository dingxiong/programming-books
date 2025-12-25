# sasl

SASL stands for "Simple Authentication and Security Layer".

The best material about SASL is probably
[gsasl](https://www.gnu.org/software/gsasl/manual/html_node/SASL-Overview.html).
SASL is a framework, not an authentication implementation. When using SASL, you
are responsible for picking up a underlying authentication mechanism. Here, we
discuss a few commonly used mechanisms.

## PLAIN

This is simplest authentication mechanism: (user id, clear-text password). It
is so simple that you can finish reading its
[standard doc](https://www.rfc-editor.org/rfc/rfc4616.html) in five minutes.
However, as it communicates clear-text password to server, it should be used on
top of a secure transportation layer, i.e., TLS. I think most Kafka users must
have heard about SASL/PLAIN.

## CRAM-MD5

CRAM stands for Challenge Response Authentication Mechanism.
