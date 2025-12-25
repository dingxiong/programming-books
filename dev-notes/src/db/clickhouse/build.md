# Build

## MacOs

See https://clickhouse.com/docs/en/development/build-osx

First install required dependencies, then

```
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
export CC=$(brew --prefix llvm)/bin/clang
export CXX=$(brew --prefix llvm)/bin/clang++
cmake -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCMAKE_EXPORT_COMPILE_COMMANDS=1 -S . -B build
cmake --build build

```

TODO: this part is not finished. Clickhouse uses git submodules, and there are
so many things inside the `contrib` subfolder. I do not have enough disk for
it.
