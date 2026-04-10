# jdk

Build compilation database for hotspot. See instruction
[here](https://github.com/openjdk/jdk/blob/master/doc/building.md).

```
bash configure METAL=/usr/bin/true METALLIB=/usr/bin/true
make compile-commands-hotspot

cd src/hotspot/
ln -s ~/code/jdk/build/macosx-aarch64-server-release/compile_commands.json compile_commands.json
```

Todo:

1. -Xbatch
2. -Xint
3. -XX:CompileCommand=
4. -XX:-TieredCompilation
5. -XX:TieredStopAtLevel=

Finish reading
<https://eme64.github.io/blog/2024/12/24/Intro-to-C2-Part01.html>
