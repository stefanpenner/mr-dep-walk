# mr-dep-walk

[![Build Status](https://travis-ci.org/stefanpenner/mr-dep-walk.svg?branch=master)](https://travis-ci.org/stefanpenner/mr-dep-walk)
[![Build status](https://ci.appveyor.com/api/projects/status/ybwgahl64faf0507?svg=true)](https://ci.appveyor.com/project/embercli/mr-dep-walk)

This library extracts dependent files from both ES6 module syntax, and AMD module syntax;

## Usage

```
yarn add mr-dep-walk
```

```js
const { depFilesFromFile, depsFromFile, depsFromSrouce } = require('mr-dep-walk');
```

For `depFilesFromFile` given an entry file, it will produce a list of all dependent files (recursively):
```js
// file.js
import x from 'y';

// y.js
```

```js
depFilesFromFile({
  entry: 'file.js',
  cwd: '' /* optional */
}); // => 'y.js';
```

For `depsFromFile` given a file, it will produce a list of its immediate dependent moduleNames;

```js
// file.js
import x from 'y';

// y.js
```

```js
depsFromFile({
  entry: 'file.js',
  cwd: '' /* optional */
}); // => 'y';
```


For `depsFromSource` given the raw source, it will produce a list of its immediate dependent moduleNames;

```js
depsFromSource(`import x from 'y'`); // => 'y'
```

For `depsFromAST` given the AST, it will produce a list of its immediate dependent moduleNames;

```js
depsFromSource(acorn.parse(`import x from 'y'`, {
  ecmacVersion: 8,
  sourceType: 'module'
})); // => 'y'
```
