import { Constructor } from '@/mixins/Constructor.type'

/**
 * Composes multiple mixins into a single class by applying them in sequence.
 *
 * @param BaseClass - The base class to which the mixins will be applied.
 * @param mixins - An array of mixin functions. Each mixin function takes a constructor and returns an extended constructor.
 * @returns A new class that results from applying all the mixins to the BaseClass.
 *
 * @example
 * // Define a base class
 * class Base {}
 *
 * // Define mixins
 * const MixinA = <T extends Constructor>(Base: T) => class extends Base {
 *   greet() {
 *     console.log('Hello from MixinA');
 *   }
 * };
 *
 * const MixinB = <T extends Constructor>(Base: T) => class extends Base {
 *   farewell() {
 *     console.log('Goodbye from MixinB');
 *   }
 * };
 *
 * // Compose mixins with the base class
 * const Composed = composeMixins(Base, MixinA, MixinB);
 *
 * const instance = new Composed();
 * instance.greet();     // Logs: "Hello from MixinA"
 * instance.farewell();  // Logs: "Goodbye from MixinB"
 */
export function composeMixins<T extends Constructor>(
  BaseClass: T,
  ...mixins: ((Base: T) => T)[]
): T {
  return mixins.reduce((acc, mixin) => mixin(acc), BaseClass)
}
