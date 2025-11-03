import { array_reverse } from '@balboacodes/php-utils';
import { array_pad } from '@balboacodes/php-utils';
import { explode } from '@balboacodes/php-utils';
import { array_merge } from '@balboacodes/php-utils';
import { array_reduce } from '@balboacodes/php-utils';
import { array_push } from '@balboacodes/php-utils';

export class Pipeline {
    /**
     * The object being passed through the pipeline.
     */
    protected passable: any;

    /**
     * The array of class pipes.
     */
    protected pipesArr: any[] = [];

    /**
     * The method to call on each pipe.
     */
    protected method: string = 'handle';

    /**
     * The final callback to be executed after the pipeline ends regardless of the outcome.
     */
    protected finallyFn?: Function;

    /**
     * Create a new class instance.
     */
    public constructor() {}

    /**
     * Set the object being sent through the pipeline.
     */
    public send(passable: any): this {
        this.passable = passable;

        return this;
    }

    /**
     * Set the array of pipes.
     */
    public through(...pipes: any[]): this {
        this.pipesArr = Array.isArray(pipes[0]) ? pipes[0] : pipes;

        return this;
    }

    /**
     * Push additional pipes onto the pipeline.
     */
    public pipe(...pipes: any[]): this {
        array_push(this.pipesArr, ...(Array.isArray(pipes[0]) ? pipes[0] : pipes));

        return this;
    }

    /**
     * Set the method to call on the pipes.
     */
    public via(method: string): this {
        this.method = method;

        return this;
    }

    /**
     * Run the pipeline with a final destination callback.
     */
    public then(destination: Function): any {
        const pipeline = array_reduce(array_reverse(this.pipes()), this.carry(), this.prepareDestination(destination));

        try {
            return pipeline(this.passable);
        } finally {
            if (this.finallyFn) {
                this.finallyFn(this.passable);
            }
        }
    }

    /**
     * Run the pipeline and return the result.
     */
    public thenReturn(): any {
        return this.then((passable) => passable);
    }

    /**
     * Set a final callback to be executed after the pipeline ends regardless of the outcome.
     */
    public finally(callback: Function): this {
        this.finallyFn = callback;

        return this;
    }

    /**
     * Apply the callback if the given "value" is (or resolves to) truthy.
     */
    public when<TWhenParameter, TWhenReturnType>(
        value?: ((instance: this) => TWhenParameter) | TWhenParameter,
        callback?: (instance: this, when: TWhenParameter) => TWhenReturnType,
        defaultValue?: (instance: this, when: TWhenParameter) => TWhenReturnType,
    ): this | TWhenReturnType {
        value = typeof value === 'function' ? (value as Function)(this) : value;

        if (arguments.length === 0) {
            return this;
        }

        if (value) {
            return callback?.(this, value as TWhenParameter) ?? this;
        } else if (defaultValue) {
            return defaultValue(this, value as TWhenParameter) ?? this;
        }

        return this;
    }

    /**
     * Apply the callback if the given "value" is (or resolves to) falsy.
     */
    public unless<TUnlessParameter, TUnlessReturnType>(
        value?: ((instance: this) => TUnlessParameter) | TUnlessParameter,
        callback?: (instance: this, unless: TUnlessParameter) => TUnlessReturnType,
        defaultValue?: (instance: this, unless: TUnlessParameter) => TUnlessReturnType,
    ): this | TUnlessReturnType {
        value = typeof value === 'function' ? (value as Function)(this) : value;

        if (arguments.length === 0) {
            return this;
        }

        if (!value) {
            return callback?.(this, value as TUnlessParameter) ?? this;
        } else if (defaultValue) {
            return defaultValue(this, value as TUnlessParameter) ?? this;
        }

        return this;
    }

    /**
     * Get the final piece of the Closure onion.
     */
    protected prepareDestination(destination: Function): Function {
        return (passable) => {
            try {
                return destination(passable);
            } catch (e: any) {
                return this.handleException(passable, e);
            }
        };
    }

    /**
     * Get a Closure that represents a slice of the application onion.
     */
    protected carry(): Function {
        return (stack, pipe) => {
            return (passable) => {
                let parameters;

                try {
                    if (typeof pipe === 'function') {
                        // If the pipe is a callable, then we will call it directly, but otherwise we
                        // will resolve the pipes out of the dependency container and call it with
                        // the appropriate method and arguments, returning the results back out.
                        return pipe(passable, stack);
                    }

                    // If the pipe is already an object we'll just make a callable and pass it to
                    // the pipe as-is. There is no need to do any extra parsing and formatting
                    // since the object we're given was already a fully instantiated object.
                    parameters = [passable, stack];

                    const carry = pipe[this.method](...parameters);

                    return this.handleCarry(carry);
                } catch (e: any) {
                    return this.handleException(passable, e);
                }
            };
        };
    }

    /**
     * Get the array of configured pipes.
     */
    protected pipes(): any[] {
        return this.pipesArr;
    }

    /**
     * Handle the value returned from each pipe before passing it to the next.
     */
    protected handleCarry(carry: any): any {
        return carry;
    }

    /**
     * Handle the given exception.
     *
     * @throws {Error}
     */
    protected handleException(passable: any, e: Error): any {
        throw e;
    }
}
