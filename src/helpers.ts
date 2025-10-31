import { array_key_first, array_key_last, array_shift, empty, explode, in_array } from '@balboacodes/php-utils';
import { Arr } from './Arr';
import { Collection } from './Collection';
import { Stringable } from './Stringable';

/**
 * Create a collection from the given value.
 */
export function collect<TKey extends number | string, TValue>(
    value: TValue[] | Record<TKey, TValue> = [],
): Collection<TKey, TValue> {
    return new Collection(value);
}

/**
 * Fill in data where it's missing.
 */
export function data_fill(target: any, key: (string | number)[] | string | number, value: any): any {
    return data_set(target, key, value, false);
}

/**
 * Remove / unset an item from an array or object using "dot" notation.
 */
export function data_forget(target: any, key?: (string | number)[] | string | number): any {
    const segments = Array.isArray(key) ? [...key] : explode('.', String(key));
    const segment = array_shift(segments);

    if (segment === '*' && Arr.accessible(target)) {
        if (segments.length > 0) {
            for (const inner in target) {
                data_forget((target as any)[inner], segments);
            }
        }
    } else if (Arr.accessible(target)) {
        if (segments.length > 0 && Arr.exists(target, segment)) {
            data_forget((target as any)[String(segment)], segments);
        } else {
            Arr.forget(target, String(segment));
        }
    }

    return target;
}

/**
 * Get an item from an array or object using "dot" notation.
 */
export function data_get(target: any, key?: (string | number)[] | string | number, defaultValue?: any): any {
    if (key === undefined) {
        return target;
    }

    key = Array.isArray(key) ? [...key] : explode('.', String(key));

    for (let i = 0; i < key.length; i++) {
        let segment = key[i];
        const remaining = key.slice(i + 1);

        if (segment === undefined) {
            return target;
        }

        if (segment === '*') {
            if (!Arr.accessible(target)) {
                return value(defaultValue);
            }

            const result: any[] | Record<string, any> = Array.isArray(target) ? [] : {};
            let index = 0;

            for (const item of Object.values(target)) {
                (result as any)[index] = data_get(item as any, remaining.length > 0 ? remaining : undefined);
                index++;
            }

            return in_array('*', remaining) ? Arr.collapse(result) : result;
        }

        switch (segment) {
            case '\\*':
                segment = '*';
                break;
            case '\\{first}':
                segment = '{first}';
                break;
            case '{first}':
                segment = array_key_first(target) as string | number;
                break;
            case '\\{last}':
                segment = '{last}';
                break;
            case '{last}':
                segment = array_key_last(target) as string | number;
                break;
            default:
                segment = segment;
        }

        if (Arr.accessible(target) && Arr.exists(target, segment)) {
            target = (target as any)[segment];
        } else {
            return value(defaultValue);
        }
    }

    return target;
}

/**
 * Determine if a key / property exists on an array or object using "dot" notation.
 */
export function data_has(target: any, key?: number | string | (number | string)[]): boolean {
    if (key === undefined || (Array.isArray(key) && key.length === 0)) {
        return false;
    }

    key = Array.isArray(key) ? key : explode('.', String(key));

    for (const segment of key) {
        if (Arr.accessible(target) && Arr.exists(target, segment)) {
            target = target[segment];
        } else {
            return false;
        }
    }

    return true;
}

/**
 * Set an item on an array or object using dot notation.
 */
export function data_set(
    target: any,
    key: (string | number)[] | string | number,
    value: any,
    overwrite: boolean = true,
): any {
    // Spreading the key into a new array creates a shallow copy of it, allowing us to modify the top-level properties
    // without affecting the reference passed in.
    const segments = Array.isArray(key) ? [...key] : explode('.', String(key));
    let segment = array_shift(segments);

    if (segment === '*') {
        if (!Arr.accessible(target)) {
            target = {};
        }

        if (segments.length > 0) {
            for (let i = 0; i < Object.values(target).length; i++) {
                (target as any)[i] = data_set((target as any)[i], segments, value, overwrite);
            }
        } else if (overwrite) {
            for (let i = 0; i < Object.values(target).length; i++) {
                (target as any)[i] = value;
            }
        }

        return target;
    }

    if (Arr.accessible(target)) {
        if (segments.length > 0) {
            if (!Arr.exists(target, segment)) {
                (target as any)[String(segment)] = Array.isArray(target) ? [] : {};
            }

            (target as any)[String(segment)] = data_set((target as any)[String(segment)], segments, value, overwrite);
        } else if (overwrite || !Arr.exists(target, segment)) {
            (target as any)[String(segment)] = value;
        }

        return target;
    }

    const newTarget: Record<string, any> = {};

    if (segments.length > 0) {
        newTarget[segment] = data_set(newTarget[segment], segments, value, overwrite);
    } else if (overwrite) {
        newTarget[segment] = value;
    }

    return newTarget;
}

/**
 * Get the first element of an array. Useful for method chaining.
 */
export function head<T>(array: T[] | Record<string, T>): any {
    return empty(array) ? false : Object.values(array)[0];
}

/**
 * Get the last element from an array.
 */
export function last<T>(array: T[] | Record<string, T>): any {
    return empty(array) ? false : Object.values(array).pop();
}

/**
 * Get a new stringable object from the given string.
 */
export function str(value?: string): Stringable {
    return new Stringable(value);
}

/**
 * Return the default value of the given value.
 */
export function value<TValue, TArgs extends any[]>(v: TValue | ((...args: TArgs) => TValue), ...args: TArgs): TValue {
    return typeof v === 'function' ? (v as (...args: TArgs) => TValue)(...args) : v;
}
