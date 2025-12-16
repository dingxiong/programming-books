# mTLS

## Encrypted private key

```bash
openssl rsa -in encrypted-private-key.pem -out decrypted-private-key.pem \
-passin file:passphrase.txt
```

## mTLS support in `curl`

To specify client's certificate, we should do as follows,

```bash
curl ... \
--key <private-key-file> \
--cert <client-certificate-file> \
--pass <plain-text-passphrase>
```

First, note that private key and certificate are passed in as file name, but
passphrase is passed in as plain text. You can tell the difference from
`curl`'s cmd line
[option parsing logic](https://github.com/curl/curl/blob/425a2aa1af0fec9ab41fcc1bcb316b623cebccc7/src/tool_getparam.c#L2216)
and
[ssl config](https://github.com/curl/curl/blob/425a2aa1af0fec9ab41fcc1bcb316b623cebccc7/lib/urldata.h#L276).
Why? This is because internally, curl does not do TLS by itself. All work is
delegate to Openssl. See
[code](https://github.com/curl/curl/blob/425a2aa1af0fec9ab41fcc1bcb316b623cebccc7/lib/vtls/openssl.c#L1546).
Openssl's C interface just works this way. It takes private key and certificate
file name, but passphrase as string value in its APIs.
