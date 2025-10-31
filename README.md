# Laravel Helpers

[![publish](https://github.com/balboacodes/laravel-helpers/actions/workflows/publish.yml/badge.svg)](https://github.com/balboacodes/laravel-helpers/actions/workflows/publish.yml)

## About

This package is a TypeScript port of many [Laravel](https://github.com/laravel) helpers. It aims to remain as faithful as possible to the originals.

## Installation

`npm i @balboacodes/laravel-helpers`

## Usage

Because there are so many helpers, the usage for all of them cannot be shown here. To see if the function you need is available, you can do a search of the provided type definition file or the [source](https://github.com/balboacodes/laravel-helpers/tree/main/src) here on GitHub. Here's a sampling of some of the functionality provided:

### Arrays and Objects

```ts
import { Arr } from '@balboacodes/laravel-helpers';

const array = Arr.collapse([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]);

// [1, 2, 3, 4, 5, 6, 7, 8, 9]

const object = {'products': {'desk': {'price': 100}}};

const flattened = Arr::dot(object);

// {'products.desk.price': 100}
```

### Collections

```ts
import { collect } from '@balboacodes/laravel-helpers';

const collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

const chunks = collection.chunk(4).all();

// [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]]
```

### Numbers

```ts
import { NumberFormatter } from '@balboacodes/laravel-helpers';

const number = NumberFormatter.abbreviate(1000);

// 1K
```

### Strings

```ts
import { Str, str } from '@balboacodes/laravel-helpers';

const slice = Str.after('This is my name', 'This is ');

// 'my name'

const slice = Str.of('This is my name').after('This is ').title();

// 'My Name'

const slice = str('This is my name').after('This is ').title();

// 'My Name'
```

## Documentation

The documentaion for all of the helpers can be found on Laravel's documentation pages. All you have to do is convert the syntax to JS. Here are the relevant pages to look at:

- [Arrays and Objects](https://laravel.com/docs/12.x/helpers#arrays-and-objects-method-list)
- [Collections](https://laravel.com/docs/12.x/collections#available-methods)
- [Numbers](https://laravel.com/docs/12.x/helpers#numbers-method-list)
- [Strings](https://laravel.com/docs/12.x/strings#available-methods)

## Related

If you like this package, be sure to check out our [other packages](https://www.npmjs.com/~balboacodes).
