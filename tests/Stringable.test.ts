import { hash } from '@balboacodes/php-utils';
import { expect, expectTypeOf, test } from 'vitest';
import { Stringable } from '../src/Stringable';

test('constructor', () => {
    expect(new Stringable('test').toString()).toBe('test');
});

test('append', () => {
    expect(new Stringable('test').append('ing').toString()).toBe('testing');
    expect(new Stringable('test').append('ing', ' append').toString()).toBe('testing append');
});

test('basename', () => {
    expect(new Stringable('/foo/bar/baz').basename().toString()).toBe('baz');
    expect(new Stringable('/foo/bar/baz.jpg').basename('.jpg').toString()).toBe('baz');
});

test('dirname', () => {
    expect(new Stringable('/framework/tests/Support').dirname().toString()).toBe('/framework/tests');
    expect(new Stringable('/framework/tests/Support').dirname(2).toString()).toBe('/framework');
    expect(new Stringable('framework').dirname().toString()).toBe('.');
    expect(new Stringable('.').dirname().toString()).toBe('.');
    expect(new Stringable('/framework/').dirname().toString()).toBe('/');
    expect(new Stringable('/').dirname().toString()).toBe('/');
});

test('exactly', () => {
    expect(new Stringable('foo').exactly(new Stringable('foo'))).toBe(true);
    expect(new Stringable('foo').exactly('foo')).toBe(true);
    expect(new Stringable('Foo').exactly(new Stringable('foo'))).toBe(false);
    expect(new Stringable('Foo').exactly('foo')).toBe(false);
});

test('explode', () => {
    expectTypeOf(new Stringable('Foo Bar Baz').explode(' ')).toEqualTypeOf<string[]>();
    expect(new Stringable('Foo Bar Baz').explode(' ')).toEqual(['Foo', 'Bar', 'Baz']);

    expect(new Stringable('Foo Bar Baz').explode(' ', 2)).toEqual(['Foo', 'Bar Baz']);
    expect(new Stringable('Foo Bar Baz').explode(' ', -1)).toEqual(['Foo', 'Bar']);
});

test('hash', async () => {
    const stringable = await new Stringable('foo').hash('SHA-1');
    const stringable2 = await new Stringable('foobar').hash('SHA-1');
    const stringable3 = await new Stringable('foobarbaz').hash('SHA-256');

    expect(stringable.toString()).toBe(await hash('SHA-1', 'foo'));
    expect(stringable2.toString()).toBe(await hash('SHA-1', 'foobar'));
    expect(stringable3.toString()).toBe(await hash('SHA-256', 'foobarbaz'));
});

test('isEmpty', () => {
    expect(new Stringable('').isEmpty()).toBe(true);
    expect(new Stringable('A').isEmpty()).toBe(false);
    expect(new Stringable('0').isEmpty()).toBe(false);
});

test('isNotEmpty', () => {
    expect(new Stringable('').isNotEmpty()).toBe(false);
    expect(new Stringable('A').isNotEmpty()).toBe(true);
});

test('newLine', () => {
    expect(new Stringable('Laravel').newLine().toString()).toBe('Laravel\n');
    expect(new Stringable('foo').newLine(2).append('bar').toString()).toBe('foo\n\nbar');
});

test('pipe', () => {
    const callback = () => 'bar';

    expectTypeOf(new Stringable('foo').pipe(callback)).toEqualTypeOf<Stringable>();
    expect(new Stringable('foo').pipe(callback).toString()).toBe('bar');
});

test('prepend', () => {
    expect(new Stringable('Framework').prepend('Laravel ').toString()).toBe('Laravel Framework');
});

test('scan', () => {
    expect(new Stringable('SN/123456').scan('SN/%d')).toEqual([123456]);
    expect(new Stringable('Otwell, Taylor').scan('%[^,],%s')).toEqual(['Otwell', 'Taylor']);
    expect(new Stringable('filename.jpg').scan('%[^.].%s')).toEqual(['filename', 'jpg']);
});

test('split', () => {
    const chunks = new Stringable('foobarbaz').split(3);

    expectTypeOf(chunks).toEqualTypeOf<string[] | (string | number)[][]>();
    expect(chunks).toEqual(['foo', 'bar', 'baz']);
});

test('stripTags', () => {
    expect(new Stringable('before<br>after').stripTags().toString()).toBe('beforeafter');
    expect(new Stringable('before<br>after').stripTags('<br>').toString()).toBe('before<br>after');
    expect(new Stringable('<strong>before</strong><br>after').stripTags('<br>').toString()).toBe('before<br>after');
    expect(new Stringable('<strong>before</strong><br>after').stripTags('<br><strong>').toString()).toBe(
        '<strong>before</strong><br>after',
    );
});

test('test', () => {
    const stringable = new Stringable('foo bar');

    expect(stringable.test('/bar/')).toBe(true);
    expect(stringable.test(/bar/)).toBe(true);
    expect(stringable.test('/foo (.*)/')).toBe(true);
    expect(stringable.test(/foo (.*)/)).toBe(true);
});

test('when', () => {
    expect(new Stringable('when').when(false, (self, val) => self.append(val).append('false')).toString()).toBe('when');
    expect(
        new Stringable('when false ')
            .when(
                false,
                (self, val) => self.append(val),
                (self) => self.append('fallbacks to default'),
            )
            .toString(),
    ).toBe('when false fallbacks to default');

    expect(new Stringable('when ').when(true, (self) => self.append('true')).toString()).toBe('when true');
    expect(
        new Stringable('gets a value ')
            .when(
                'from if',
                (self, val) => self.append(val),
                (self) => self.append('fallbacks to default'),
            )
            .toString(),
    ).toBe('gets a value from if');
});

test('whenContains', () => {
    expect(
        new Stringable('stark')
            .whenContains(
                'tar',
                (self) => self.prepend('Tony ').title(),
                (self) => self.prepend('Arno ').title(),
            )
            .toString(),
    ).toBe('Tony Stark');

    expect(new Stringable('stark').whenContains('xxx', (self) => self.prepend('Tony ').title()).toString()).toBe(
        'stark',
    );
    expect(
        new Stringable('stark')
            .whenContains(
                'xxx',
                (self) => self.prepend('Tony ').title(),
                (self) => self.prepend('Arno ').title(),
            )
            .toString(),
    ).toBe('Arno Stark');
});

test('whenContainsAll', () => {
    expect(
        new Stringable('tony stark')
            .whenContainsAll(
                ['tony', 'stark'],
                (self) => self.title(),
                (self) => self.studly(),
            )
            .toString(),
    ).toBe('Tony Stark');

    expect(new Stringable('tony stark').whenContainsAll(['xxx'], (self) => self.title()).toString()).toBe('tony stark');

    expect(
        new Stringable('tony stark')
            .whenContainsAll(
                ['tony', 'xxx'],
                (self) => self.title(),
                (self) => self.studly(),
            )
            .toString(),
    ).toBe('TonyStark');
});

test('whenDoesntEndWith', () => {
    expect(
        new Stringable('tony stark')
            .whenDoesntEndWith(
                'ark',
                (self) => self.studly(),
                (self) => self.title(),
            )
            .toString(),
    ).toBe('Tony Stark');

    expect(
        new Stringable('tony stark')
            .whenDoesntEndWith(
                ['kra', 'ark'],
                (self) => self.studly(),
                (self) => self.title(),
            )
            .toString(),
    ).toBe('Tony Stark');

    expect(new Stringable('tony stark').whenDoesntEndWith(['xxx'], (self) => self).toString()).toBe('tony stark');
    expect(
        new Stringable('tony stark')
            .whenDoesntEndWith(
                ['tony', 'xxx'],
                (self) => self.studly(),
                (self) => self.title(),
            )
            .toString(),
    ).toBe('TonyStark');
});

test('whenDoesntStartWith', () => {
    expect(
        new Stringable('tony stark')
            .whenDoesntStartWith(
                'ton',
                (self) => self.studly(),
                (self) => self.title(),
            )
            .toString(),
    ).toBe('Tony Stark');
    expect(
        new Stringable('tony stark')
            .whenDoesntStartWith(
                ['ton', 'not'],
                (self) => self.studly(),
                (self) => self.title(),
            )
            .toString(),
    ).toBe('Tony Stark');

    expect(new Stringable('tony stark').whenDoesntStartWith(['xxx'], (self) => self).toString()).toBe('tony stark');

    expect(
        new Stringable('tony stark')
            .whenDoesntStartWith(
                ['tony', 'xxx'],
                (self) => self.studly(),
                (self) => self.title(),
            )
            .toString(),
    ).toBe('Tony Stark');
});

test('whenEmpty', () => {
    const stringable = new Stringable();

    expect(stringable.whenEmpty().toString()).toBe(stringable.toString());
    expect(new Stringable().whenEmpty(() => new Stringable('empty')).toString()).toBe('empty');

    expect(new Stringable('not-empty').whenEmpty(() => new Stringable('empty')).toString()).toBe('not-empty');
});

test('whenEndsWith', () => {
    expect(
        new Stringable('tony stark')
            .whenEndsWith(
                'ark',
                (self) => self.title(),
                (self) => self.studly(),
            )
            .toString(),
    ).toBe('Tony Stark');
    expect(
        new Stringable('tony stark')
            .whenEndsWith(
                ['kra', 'ark'],
                (self) => self.title(),
                (self) => self.studly(),
            )
            .toString(),
    ).toBe('Tony Stark');

    expect(new Stringable('tony stark').whenEndsWith(['xxx'], (self) => self.title()).toString()).toBe('tony stark');
    expect(
        new Stringable('tony stark')
            .whenEndsWith(
                ['tony', 'xxx'],
                (self) => self.title(),
                (self) => self.studly(),
            )
            .toString(),
    ).toBe('TonyStark');
});

test('whenExactly', () => {
    expect(
        new Stringable('Tony Stark')
            .whenExactly(
                'Tony Stark',
                () => new Stringable('Nailed it...!'),
                () => new Stringable('Swing and a miss...!'),
            )
            .toString(),
    ).toBe('Nailed it...!');

    expect(
        new Stringable('Tony Stark')
            .whenExactly(
                'Iron Man',
                () => new Stringable('Nailed it...!'),
                () => new Stringable('Swing and a miss...!'),
            )
            .toString(),
    ).toBe('Swing and a miss...!');
    expect(new Stringable('Tony Stark').whenExactly('Iron Man', () => new Stringable('Nailed it...!')).toString()).toBe(
        'Tony Stark',
    );
});

test('whenIs', () => {
    expect(
        new Stringable('/')
            .whenIs(
                '/',
                (self) => self.prepend('Winner: '),
                () => new Stringable('Try again'),
            )
            .toString(),
    ).toBe('Winner: /');
    expect(new Stringable('/').whenIs(' /', (self) => self.prepend('Winner: ')).toString()).toBe('/');

    expect(
        new Stringable('/')
            .whenIs(
                ' /',
                (self) => self.prepend('Winner: '),
                () => new Stringable('Try again'),
            )
            .toString(),
    ).toBe('Try again');

    expect(new Stringable('foo/bar/baz').whenIs('foo/*', (self) => self.prepend('Winner: ')).toString()).toBe(
        'Winner: foo/bar/baz',
    );
});

test('whenNotEmpty', () => {
    const stringable = new Stringable();

    expect(stringable.whenNotEmpty((self) => self.append('.')).toString()).toBe(stringable.toString());
    expect(new Stringable().whenNotEmpty((self) => self.append('.')).toString()).toBe('');

    expect(new Stringable('Not empty').whenNotEmpty((self) => self.append('.')).toString()).toBe('Not empty.');
});

test('whenNotExactly', () => {
    expect(new Stringable('Tony').whenNotExactly('Tony Stark', () => new Stringable('Iron Man')).toString()).toBe(
        'Iron Man',
    );

    expect(
        new Stringable('Tony Stark')
            .whenNotExactly(
                'Tony Stark',
                () => new Stringable('Iron Man'),
                () => new Stringable('Swing and a miss...!'),
            )
            .toString(),
    ).toBe('Swing and a miss...!');
});

test('whenStartsWith', () => {
    expect(
        new Stringable('tony stark')
            .whenStartsWith(
                'ton',
                (self) => self.title(),
                (self) => self.studly(),
            )
            .toString(),
    ).toBe('Tony Stark');
    expect(
        new Stringable('tony stark')
            .whenStartsWith(
                ['ton', 'not'],
                (self) => self.title(),
                (self) => self.studly(),
            )
            .toString(),
    ).toBe('Tony Stark');

    expect(new Stringable('tony stark').whenStartsWith(['xxx'], (self) => self.title()).toString()).toBe('tony stark');

    expect(
        new Stringable('tony stark')
            .whenStartsWith(
                ['tony', 'xxx'],
                (self) => self.title(),
                (self) => self.studly(),
            )
            .toString(),
    ).toBe('Tony Stark');
});

test('whenTest', () => {
    expect(
        new Stringable('foo bar')
            .whenTest(
                '/bar/',
                (self) => self.prepend('Winner: '),
                () => new Stringable('Try again'),
            )
            .toString(),
    ).toBe('Winner: foo bar');

    expect(
        new Stringable('foo bar')
            .whenTest(
                /bar/,
                (self) => self.prepend('Winner: '),
                () => new Stringable('Try again'),
            )
            .toString(),
    ).toBe('Winner: foo bar');

    expect(
        new Stringable('foo bar')
            .whenTest(
                '/link/',
                (self) => self.prepend('Winner: '),
                () => new Stringable('Try again'),
            )
            .toString(),
    ).toBe('Try again');

    expect(
        new Stringable('foo bar')
            .whenTest(
                /link/,
                (self) => self.prepend('Winner: '),
                () => new Stringable('Try again'),
            )
            .toString(),
    ).toBe('Try again');

    expect(new Stringable('foo bar').whenTest('/link/', (self) => self.prepend('Winner: ')).toString()).toBe('foo bar');
    expect(new Stringable('foo bar').whenTest(/link/, (self) => self.prepend('Winner: ')).toString()).toBe('foo bar');
});

test('unless', () => {
    expect(new Stringable('unless').unless(false, (self) => self.append(' false')).toString()).toBe('unless false');

    expect(
        new Stringable('unless')
            .unless(
                true,
                (self, val) => self.append(val),
                (self) => self.append(' true fallbacks to default'),
            )
            .toString(),
    ).toBe('unless true fallbacks to default');
});

test('unless', () => {
    expect(new Stringable('unless').unless(1, (self, val) => self.append(val).append('true')).toString()).toBe(
        'unless',
    );
    expect(
        new Stringable('unless true ')
            .unless(
                1,
                (self, val) => self.append(val),
                (self, val) => self.append('fallbacks to default with value ').append(val),
            )
            .toString(),
    ).toBe('unless true fallbacks to default with value 1');

    expect(new Stringable('unless ').unless(0, (self, val) => self.append(val)).toString()).toBe('unless 0');
    expect(
        new Stringable('gets the value ')
            .unless(
                0,
                (self, val) => self.append(val),
                (self) => self.append('fallbacks to default'),
            )
            .toString(),
    ).toBe('gets the value 0');
});
