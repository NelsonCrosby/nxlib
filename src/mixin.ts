/**
 * An implementation for mixins in JavaScript. This implementation plays well
 * with TypeScript.
 * 
 * _Mixins_ (sometimes called _traits_) serve to add _behaviours_ to a
 * subclass. They are a type of code re-use and multiple inheritance.
 * 
 * This utility implements mixins [as described by Justin Fagnani][pattern].
 * Unfortunately, some extra syntactical overhead is required to make
 * TypeScript recognise the mixin definitions properly.
 * 
 * Typical usage is like so:
 * 
 *      import { mixin, mix } from 'nxlib/mixin'
 * 
 *      interface Bar {
 *          _bar: string
 *          addBars(s: string): string
 *      }
 *      const Bar = mixin<Bar>(_ => class extends _ {
 *          _bar: string = '|'
 *          addBars(s: string): string {
 *              return `${this.bar} ${s} ${this.bar}`
 *          }
 *      })
 * 
 *      class Foo {
 *          protected _foo: string
 *          constructor(foo: string) {
 *              this._foo = foo
 *          }
 *      }
 * 
 *      class FooBar extends mix(Foo).with(Bar) {
 *          constructor() {
 *              super('Hello!')
 *              this._bar = '_'
 *          }
 * 
 *          get foo(): string {
 *              return this.addBars(this._foo)
 *          }
 *      }
 * 
 * [pattern]: http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 */

/**
 * A simple interface representing a class.
 * 
 * @typeparam T The actual type of this class
 */
export interface Class<T> {
    /**
     * Classes are identified by the fact
     * that they have some constructor.
     */
    new(...args: any[]): T
}

/**
 * The interface representing mixins.
 * 
 * @typeparam T The interface that this mixin implements
 */
export interface Mixin<T> {
    /**
     * A mixin is a function that returns a subclass of its
     * argument.
     */
    (from: Class<any>): Class<T>
}

/**
 * Takes a raw mixin and adds simple functionality. TODO.
 * 
 * @typeparam T The interface that this mixin implements
 * @param m The raw mixin
 * @returns The mixin unchanged
 */
export function mixin<T>(m: Mixin<T>): Mixin<T> {
    return m
}

/**
 * This function provides a nice syntax for using mixins:
 * 
 *      class Buzz extends mix().with(Bar, Baz) {
 *          // ...
 *      }
 * 
 * @returns A `MixinBuilder` without an associated superclass
 */
export function mix(): MixinBuilder<Object>
/**
 * This function provides a nice syntax for using mixins with a primary
 * superclass:
 * 
 *      class FooBar extends mix(Foo).with(Bar) {
 *          // ...
 *      }
 * 
 * @typeparam S The superclass type
 * @param superclass The primary superclass
 * @returns A `MixinBuilder` associated with the given superclass
 */
export function mix<S>(superclass: Class<S>): MixinBuilder<S>
export function mix<S>(superclass?: Class<S>): MixinBuilder<S | Object> {
    return new MixinBuilder(superclass || Object)
}

/**
 * This function combines two mixins.
 * 
 * It allows for combined mixins (1) and to extend mixins (2):
 * 
 *      type BarBaz = Bar & Baz                     // (1)
 *      const BarBaz = mixins(Bar, Baz)             // (1)
 *      interface Box extends BarBaz { }            // (2)
 *      const Box = mixin<Box>(_ => class extends BarBaz {
 *          // ...
 *      })
 * 
 * @typeparam T1 The interface of mixin 1
 * @typeparam T2 The interface of mixin 2
 * @param m1 Mixin 1
 * @param m2 Mixin 2
 * @returns A mixin that is exactly the same as both mixins together
 */
export function mixins<T1, T2>
    (m1: Mixin<T1>, m2: Mixin<T2>):
    Mixin<T1 & T2>
export function mixins<T1, T2, T3>
    (m1: Mixin<T1>, m2: Mixin<T2>, m3: Mixin<T3>):
    Mixin<T1 & T2 & T3>
export function mixins<T1, T2, T3, T4>
    (m1: Mixin<T1>, m2: Mixin<T2>, m3: Mixin<T3>, m4: Mixin<T4>):
    Mixin<T1 & T2 & T3 & T4>
export function mixins(...mixins: any[]) {
    return (_: any) => mixins.reduce((c, mixin) => mixin(c), _)
}

/**
 * A `MixinBuilder` is a helper that allows for a nicer usage syntax:
 * 
 *      class FooBar extends mix(Foo).with(Bar) {
 *          // ...
 *      }
 * 
 * @typeparam S The type of the superclass passed to `mix`
 */
export class MixinBuilder<S> {
    private superclass: Class<S>

    /**
     * This constructor is not meant to be used directly.
     * 
     * Please use the `mix` function.
     */
    constructor(superclass: Class<S>) {
        this.superclass = superclass
    }

    /**
     * Add a mixin to the associated class.
     * 
     * @typeparam T The interface of the mixin
     * @param mixin The mixin to add
     * @returns The superclass associated with this `MixinBuilder`,
     *          mixed with the mixin
     */
    with<T>(mixin: Mixin<T>): Class<S & T>
    /**
     * Add a mixin to the associated class.
     * 
     * @typeparam T1 The interface of mixin 1
     * @typeparam T2 The interface of mixin 2
     * @param m1 The first mixin to add
     * @param m2 The second mixin to add
     * @returns The superclass associated with this `MixinBuilder`,
     *          mixed with the mixins
     */
    with<T1, T2>
        (m1: Mixin<T1>, m2: Mixin<T2>):
        Class<S & T1 & T2>
    with<T1, T2, T3>
        (m1: Mixin<T1>, m2: Mixin<T2>, m3: Mixin<T3>):
        Class<S & T1 & T2 & T3>
    with<T1, T2, T3, T4>
        (m1: Mixin<T1>, m2: Mixin<T2>, m3: Mixin<T3>, m4: Mixin<T4>):
        Class<S & T1 & T2 & T3 & T4>

    with(...mixins: any[]) {
        return mixins.reduce((c, mixin) => mixin(c), this.superclass)
    }
}
