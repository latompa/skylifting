import { describe, it, expect } from 'vitest'

describe('Test setup', () => {
  it('should run tests', () => {
    expect(true).toBe(true)
  })

  it('should have IndexedDB available', () => {
    expect(typeof indexedDB).toBe('object')
  })
})
