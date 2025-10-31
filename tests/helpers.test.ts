import { expect, test } from 'vitest';
// prettier-ignore
import {
    blank,
    data_fill, data_forget, data_get, data_has, data_set, head, last, now, rescue, str, value, when,
} from '../src/helpers';
import { Stringable } from '../src/Stringable';

test('blank', () => {
    expect(blank(null)).toEqual(true);
    expect(blank('')).toEqual(true);
    expect(blank('  ')).toEqual(true);
    expect(blank(new Stringable(''))).toEqual(true);
    expect(blank(new Stringable('  '))).toEqual(true);
    expect(blank(10)).toEqual(false);
    expect(blank(true)).toEqual(false);
    expect(blank(false)).toEqual(false);
    expect(blank(0)).toEqual(false);
    expect(blank(0.0)).toEqual(false);
    expect(blank(new Stringable(' FooBar '))).toEqual(false);
    expect(blank({})).toEqual(true);
});

test('data_fill', () => {
    let data: any = { foo: 'bar' };

    expect(data_fill(data, 'baz', 'boom')).toEqual({ foo: 'bar', baz: 'boom' });
    expect(data_fill(data, 'baz', 'noop')).toEqual({ foo: 'bar', baz: 'boom' });
    expect(data_fill(data, 'foo.*', 'noop')).toEqual({ foo: {}, baz: 'boom' });
    expect(data_fill(data, 'foo.bar', 'kaboom')).toEqual({ foo: { bar: 'kaboom' }, baz: 'boom' });

    data = { foo: 'bar' };

    expect(data_fill(data, 'foo.*.bar', 'noop')).toEqual({ foo: {} });
    expect(data_fill(data, 'bar', [{ baz: 'original' }, []])).toEqual({ foo: {}, bar: [{ baz: 'original' }, []] });
    expect({ foo: {}, bar: [{ baz: 'original' }, { baz: 'boom' }] }, data_fill(data, 'bar.*.baz', 'boom'));
    expect({ foo: {}, bar: [{ baz: 'original' }, { baz: 'boom' }] }, data_fill(data, 'bar.*', 'noop'));

    data = {
        posts: [
            {
                comments: [{ name: 'First' }, {}],
            },
            {
                comments: [{}, { name: 'Second' }],
            },
        ],
    };

    expect(data_fill(data, 'posts.*.comments.*.name', 'Filled')).toEqual({
        posts: [
            {
                comments: [{ name: 'First' }, { name: 'Filled' }],
            },
            {
                comments: [{ name: 'Filled' }, { name: 'Second' }],
            },
        ],
    });
});

test('data_forget', () => {
    let data: any = { foo: 'bar', hello: 'world' };

    expect(data_forget(data, 'foo')).toEqual({ hello: 'world' });

    data = { foo: 'bar', hello: 'world' };

    expect(data_forget(data, 'nothing')).toEqual({ foo: 'bar', hello: 'world' });

    data = { one: { two: { three: 'hello', four: ['five'] } } };

    expect(data_forget(data, 'one.two.three')).toEqual({ one: { two: { four: ['five'] } } });

    data = {
        article: {
            title: 'Foo',
            comments: [
                { comment: 'foo', name: 'First' },
                { comment: 'bar', name: 'Second' },
            ],
        },
    };

    expect(data_forget(data, 'article.comments.*.name')).toEqual({
        article: {
            title: 'Foo',
            comments: [{ comment: 'foo' }, { comment: 'bar' }],
        },
    });

    data = {
        posts: [
            {
                comments: [
                    { name: 'First', comment: 'foo' },
                    { name: 'Second', comment: 'bar' },
                ],
            },
            {
                comments: [
                    { name: 'Third', comment: 'hello' },
                    { name: 'Fourth', comment: 'world' },
                ],
            },
        ],
    };

    expect(data_forget(data, 'posts.*.comments.*.name')).toEqual({
        posts: [
            {
                comments: [{ comment: 'foo' }, { comment: 'bar' }],
            },
            {
                comments: [{ comment: 'hello' }, { comment: 'world' }],
            },
        ],
    });
});

test('data_get', () => {
    const object = { users: { name: ['Taylor', 'Otwell'] } };
    let array: any = [{ users: [{ name: 'Taylor' }] }];
    const dottedArray = { users: { 'first.name': 'Taylor', 'middle.name': null } };

    expect(data_get(object, 'users.name.0')).toBe('Taylor');
    expect(data_get(array, '0.users.0.name')).toBe('Taylor');
    expect(data_get(array, '0.users.3')).toBe(undefined);
    expect(data_get(array, '0.users.3', 'Not found')).toBe('Not found');
    expect(data_get(array, '0.users.3', () => 'Not found')).toBe('Not found');
    expect(data_get(dottedArray, ['users', 'first.name'])).toBe('Taylor');
    expect(data_get(dottedArray, ['users', 'middle.name'])).toBe(null);
    expect(data_get(dottedArray, ['users', 'last.name'], 'Not found')).toBe('Not found');

    array = [{ name: 'taylor', email: 'taylorotwell@gmail.com' }, { name: 'abigail' }, { name: 'dayle' }];

    expect(data_get(array, '*.name')).toEqual(['taylor', 'abigail', 'dayle']);
    expect(data_get(array, '*.email', 'irrelevant')).toEqual(['taylorotwell@gmail.com', undefined, undefined]);

    array = {
        users: [
            { first: 'taylor', last: 'otwell', email: 'taylorotwell@gmail.com' },
            { first: 'abigail', last: 'otwell' },
            { first: 'dayle', last: 'rees' },
        ],
        posts: null,
    };

    expect(data_get(array, 'users.*.first')).toEqual(['taylor', 'abigail', 'dayle']);
    expect(data_get(array, 'users.*.email', 'irrelevant')).toEqual(['taylorotwell@gmail.com', undefined, undefined]);
    expect(data_get(array, 'posts.*.date', 'not found')).toBe('not found');
    expect(data_get(array, 'posts.*.date')).toBe(undefined);

    array = {
        posts: [
            {
                comments: [
                    { author: 'taylor', likes: 4 },
                    { author: 'abigail', likes: 3 },
                ],
            },
            {
                comments: [{ author: 'abigail', likes: 2 }, { author: 'dayle' }],
            },
            {
                comments: [{ author: 'dayle' }, { author: 'taylor', likes: 1 }],
            },
        ],
    };

    expect(data_get(array, 'posts.*.comments.*.author')).toEqual([
        'taylor',
        'abigail',
        'abigail',
        'dayle',
        'dayle',
        'taylor',
    ]);

    expect(data_get(array, 'posts.*.comments.*.likes')).toEqual([4, 3, 2, undefined, undefined, 1]);
    expect(data_get(array, 'posts.*.users.*.name', 'irrelevant')).toEqual([]);
    expect(data_get(array, 'posts.*.users.*.name')).toEqual([]);

    array = {
        flights: [
            {
                segments: [
                    { from: 'LHR', departure: '9:00', to: 'IST', arrival: '15:00' },
                    { from: 'IST', departure: '16:00', to: 'PKX', arrival: '20:00' },
                ],
            },
            {
                segments: [
                    { from: 'LGW', departure: '8:00', to: 'SAW', arrival: '14:00' },
                    { from: 'SAW', departure: '15:00', to: 'PEK', arrival: '19:00' },
                ],
            },
        ],
        empty: [],
    };

    expect(data_get(array, 'flights.0.segments.{first}.from')).toEqual('LHR');
    expect(data_get(array, 'flights.0.segments.{last}.to')).toEqual('PKX');
    expect(data_get(array, 'flights.{first}.segments.{first}.from')).toEqual('LHR');
    expect(data_get(array, 'flights.{last}.segments.{last}.to')).toEqual('PEK');
    expect(data_get(array, 'flights.{first}.segments.{last}.to')).toEqual('PKX');
    expect(data_get(array, 'flights.{last}.segments.{first}.from')).toEqual('LGW');
    expect(data_get(array, 'flights.{first}.segments.*.from')).toEqual(['LHR', 'IST']);
    expect(data_get(array, 'flights.{last}.segments.*.to')).toEqual(['SAW', 'PEK']);
    expect(data_get(array, 'flights.*.segments.{first}.from')).toEqual(['LHR', 'LGW']);
    expect(data_get(array, 'flights.*.segments.{last}.to')).toEqual(['PKX', 'PEK']);
    expect(data_get(array, 'empty.{first}', 'Not found')).toEqual('Not found');
    expect(data_get(array, 'empty.{last}', 'Not found')).toEqual('Not found');

    array = {
        numericKeys: ['first', 'second', 'last'],
        stringKeys: {
            one: 'first',
            two: 'second',
            three: 'last',
        },
    };

    expect(data_get(array, 'numericKeys.0')).toEqual('first');
    expect(data_get(array, 'numericKeys.{first}')).toEqual('first');
    expect(data_get(array, 'numericKeys.{last}')).toEqual('last');
    expect(data_get(array, 'stringKeys.{first}')).toEqual('first');
    expect(data_get(array, 'stringKeys.{last}')).toEqual('last');

    array = {
        symbols: {
            '{last}': { description: 'dollar' },
            '*': { description: 'asterisk' },
            '{first}': { description: 'caret' },
        },
    };

    expect(data_get(array, 'symbols.\\{first}.description')).toEqual('caret');
    expect(data_get(array, 'symbols.{first}.description')).toEqual('dollar');
    expect(data_get(array, 'symbols.\\*.description')).toEqual('asterisk');
    expect(data_get(array, 'symbols.*.description')).toEqual({ 0: 'dollar', 1: 'asterisk', 2: 'caret' });
    expect(data_get(array, 'symbols.\\{last}.description')).toEqual('dollar');
    expect(data_get(array, 'symbols.{last}.description')).toEqual('caret');

    let data: any = { foo: 'bar' };

    expect(data_get(data, '*')).toEqual({ 0: 'bar' });

    data = { foo: 'bar' };

    expect(data_get(data, undefined)).toEqual({ foo: 'bar' });
    expect(data_get(data, undefined, '42')).toEqual({ foo: 'bar' });

    data = { foo: 'bar', baz: 42 };

    expect(data_get(data, ['foo'])).toEqual('bar');
});

test('data_has', () => {
    const object = { users: { name: ['Taylor', 'Otwell'] } };
    const array = [{ users: [{ name: 'Taylor' }] }];
    const dottedArray = { users: { 'first.name': 'Taylor', 'middle.name': null } };
    const sameKeyMultiLevel = { name: 'Taylor', company: { name: 'Laravel' } };
    const plainArray = [1, 2, 3];

    expect(data_has(object, 'users.name.0')).toEqual(true);
    expect(data_has(array, '0.users.0.name')).toEqual(true);
    expect(data_has(array, '0.users.3')).toEqual(false);
    expect(data_has(array, '0.users.3')).toEqual(false);
    expect(data_has(array, '0.users.3')).toEqual(false);
    expect(data_has(dottedArray, ['users', 'first.name'])).toEqual(true);
    expect(data_has(dottedArray, ['users', 'middle.name'])).toEqual(true);
    expect(data_has(dottedArray, ['users', 'last.name'])).toEqual(false);
    expect(data_has(sameKeyMultiLevel, 'name')).toEqual(true);
    expect(data_has(sameKeyMultiLevel, 'company.name')).toEqual(true);
    expect(data_has(sameKeyMultiLevel, 'foo.name')).toEqual(false);
    expect(data_has(plainArray, 0)).toEqual(true);
    expect(data_has(plainArray, '0')).toEqual(true);
    expect(data_has(plainArray, 4)).toEqual(false);
    expect(data_has(plainArray, '4')).toEqual(false);
    expect(data_has(plainArray, '')).toEqual(false);
    expect(data_has(plainArray, [])).toEqual(false);
    expect(data_has(plainArray, undefined)).toEqual(false);
});

test('data_set', () => {
    let data: any = { foo: 'bar' };

    expect(data_set(data, 'baz', 'boom')).toEqual({ foo: 'bar', baz: 'boom' });
    expect(data_set(data, 'baz', 'kaboom')).toEqual({ foo: 'bar', baz: 'kaboom' });
    expect(data_set(data, 'foo.*', 'noop')).toEqual({ foo: {}, baz: 'kaboom' });
    expect(data_set(data, 'foo.bar', 'boom')).toEqual({ foo: { bar: 'boom' }, baz: 'kaboom' });
    expect(data_set(data, 'baz.bar', 'boom')).toEqual({ foo: { bar: 'boom' }, baz: { bar: 'boom' } });
    expect(data_set(data, 'baz.bar.boom.kaboom', 'boom')).toEqual({
        foo: { bar: 'boom' },
        baz: { bar: { boom: { kaboom: 'boom' } } },
    });

    data = { foo: 'bar' };

    expect(data_set(data, 'foo.*.bar', 'noop')).toEqual({ foo: {} });
    expect(data_set(data, 'bar', [{ baz: 'original' }, {}])).toEqual({ foo: {}, bar: [{ baz: 'original' }, {}] });
    expect(data_set(data, 'bar.*.baz', 'boom')).toEqual({ foo: {}, bar: [{ baz: 'boom' }, { baz: 'boom' }] });
    expect(data_set(data, 'bar.*', 'overwritten')).toEqual({ foo: {}, bar: ['overwritten', 'overwritten'] });

    data = {
        posts: [
            {
                comments: [{ name: 'First' }, {}],
            },
            {
                comments: [{}, { name: 'Second' }],
            },
        ],
    };

    expect(data_set(data, 'posts.*.comments.*.name', 'Filled')).toEqual({
        posts: [
            {
                comments: [{ name: 'Filled' }, { name: 'Filled' }],
            },
            {
                comments: [{ name: 'Filled' }, { name: 'Filled' }],
            },
        ],
    });
});

test('head', () => {
    const array = ['a', 'b', 'c'];

    expect(head(array)).toBe('a');
});

test('last', () => {
    const array = ['a', 'b', 'c'];

    expect(last(array)).toBe('c');
});

test('now', () => {
    let date = now();
    expect(date).toBeInstanceOf(Date);

    date.setDate(1);
    expect(date.getDate()).toEqual(1);

    date = now('utc');
    expect(date).toBeInstanceOf(Date);

    date.setUTCFullYear(2000);
    expect(date.getUTCFullYear()).toEqual(2000);
});

test('rescue', () => {
    const th = () => {
        throw new Error();
    };
    expect(rescue(() => true)).toEqual(true);
    expect(rescue(th)).toEqual(undefined);
    expect(rescue(th, () => 'rescued')).toEqual('rescued');
});

test('str', () => {
    const string = new Stringable('foo');

    expect(str(string.toString())).toBeInstanceOf(Stringable);
    expect(str('foo').toString()).toBe(string.toString());
});

test('value', () => {
    const callable = (args: any) => args;

    expect(value(callable, 'foo')).toBe('foo');
    expect(value('foo')).toBe('foo');
    expect(value(() => 'foo')).toBe('foo');
    expect(value((arg) => arg, 'foo')).toBe('foo');
});

test('when', () => {
    expect(when(true, 'Hello')).toEqual('Hello');
    expect(when(false, 'Hello')).toEqual(undefined);
    expect(when(1 === 1, 'There')).toEqual('There'); // strict types
    // @ts-ignore
    expect(when(1 == '1', 'There')).toEqual('There'); // loose types
    // @ts-ignore
    expect(when(1 == 2, 'There')).toEqual(undefined);
    expect(when('1', () => null)).toEqual(null);
    expect(when(0, () => null)).toEqual(undefined);
    expect(when([1, 2, 3, 4], 'True')).toEqual('True'); // Array
    expect(when([], 'True')).toEqual('True'); // Empty Array = Truthy
    expect(when({}, () => 'True')).toEqual('True'); // Object
    expect(when(false, 'Hello', 'World')).toEqual('World');
    // @ts-ignore
    expect(when(1 === 0, 'Hello', 'World')).toEqual('World'); // strict types
    // @ts-ignore
    expect(when(1 == '0', 'Hello', 'World')).toEqual('World'); // loose types
    expect(
        when(
            '',
            () => 'There',
            () => null,
        ),
    ).toEqual(null);
    expect(
        when(
            0,
            () => 'There',
            () => null,
        ),
    ).toEqual(null);
    expect(when([], 'True', 'False')).toEqual('True'); // Empty Array = Truthy
    expect(
        when(
            true,
            (value: true) => value,
            (value: true) => !value,
        ),
    ).toEqual(true); // lazy evaluation
    expect(
        when(
            false,
            (value: false) => value,
            (value: false) => !value,
        ),
    ).toEqual(true); // lazy evaluation
    expect(when(() => true, 'Hello')).toEqual('Hello'); // lazy evaluation condition
    expect(when(() => false, 'Hello', 'World')).toEqual('World'); // lazy evaluation condition
});
