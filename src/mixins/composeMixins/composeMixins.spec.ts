import { describe, it, expect } from 'vitest'
import { composeMixins } from './composeMixins'

class Base {
  name = 'BaseClass'
}

// Define a mixin that adds a "greet" method
const MixinA = <T extends new (...args: any[]) => {}>(Base: T) =>
  class extends Base {
    greet() {
      return 'Hello from MixinA'
    }
  }

// Define a mixin that adds a "farewell" method
const MixinB = <T extends new (...args: any[]) => {}>(Base: T) =>
  class extends Base {
    farewell() {
      return 'Goodbye from MixinB'
    }
  }

describe('composeMixins', () => {
  it('should return a class with all mixin methods applied', () => {
    const ComposedClass = composeMixins(Base, MixinA, MixinB)
    const instance = new ComposedClass()

    // Check that instance is an instance of the base class
    expect(instance).toBeInstanceOf(Base)
    // Check mixin methods
    expect(typeof instance.greet).toBe('function')
    expect(instance.greet()).toBe('Hello from MixinA')
    expect(typeof instance.farewell).toBe('function')
    expect(instance.farewell()).toBe('Goodbye from MixinB')
  })

  it('should work with a single mixin', () => {
    const ComposedSingle = composeMixins(Base, MixinA)
    const instance = new ComposedSingle()

    expect(instance).toBeInstanceOf(Base)
    expect(typeof instance.greet).toBe('function')
    expect(instance.greet()).toBe('Hello from MixinA')
    // MixinB method should not exist
    expect((instance as any).farewell).toBeUndefined()
  })

  it('should return the base class when no mixins are provided', () => {
    const ComposedEmpty = composeMixins(Base)
    const instance = new ComposedEmpty()

    expect(instance).toBeInstanceOf(Base)
    // No additional methods from mixins should be present
    expect((instance as any).greet).toBeUndefined()
    expect((instance as any).farewell).toBeUndefined()
  })
})
