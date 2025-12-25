# AES (Advanced Encryption Standard)

AES is block cypher. It describe the process to encrypt a 128bit data block.
However, AES itself does not specify how to encrypt a stream of bytes. You may
think a naive way is to divide the byte stream into 128bit, i.e., 16 bytes
chunks, and pad the last chunk if its size is less than 16 bytes, but nobody
does it this way as it is easy to crack. (TODO: read more to verify this
statement). Usually, people choose a block cypher mode to accomplish AES.
Basically, you can think of this cypher mode will use and update an
initialization vector between encrypting each 128bit block.

Many different block cypher modes exit. The good paper on this subject is
[MODES OF OPERATION OF THE AES ALGORITHM](http://ciit.finki.ukim.mk/data/papers/10CiiT/10CiiT-46.pdf).
Below we just cover the most popular ones.

## GCM mode: Galois/Counter mode

## AES-GCM-SIV
