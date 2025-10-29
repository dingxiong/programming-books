# Introduction

My notes about various programming topics.

## Add yarn and related tools

Even thought I hate using yarn/npm, but I can not find a good formatter at the
level of `prettier` in Rust.

```
nvm install 25.0.0
echo 25.0.0 > .nvmrc
npm install --global yarn
```

Initialize the repo.

```
yarn init -2
```

Install husky

```
yarn add husky -D
yarn husky init
```

Install linter and lint-staged

```
yarn add -D prettier
yarn add -D lint-staged
```

Add a lint-staged block and also, add yarn lint-staged in .husky/pre-commit.

Node, every time, we need do nvm use before commit.

## cpp-book

Local development

```
mdbook serve --open
```

Show debug logs.

```
RUST_LOG=debug mdbook build
```
