# curl

Curl's [official installation page](https://curl.se/docs/install.html) is not
accurate. To build `curl` locally, see below instructions.

```bash
./buildconf
./configure --with-openssl
bear -- make -j5
```
