import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatDateInputValue,
  formatPlannerShortDate,
  formatTimeInputValue,
  getStartOfWeek,
  openDrawerNextFrame,
} from './utils.ts'

test('formatDateInputValue returns YYYY-MM-DD', () => {
  const date = new Date(2026, 3, 5, 14, 20)
  assert.equal(formatDateInputValue(date), '2026-04-05')
})

test('formatTimeInputValue returns HH:mm', () => {
  const date = new Date(2026, 3, 5, 9, 7)
  assert.equal(formatTimeInputValue(date), '09:07')
})

test('getStartOfWeek returns Monday at midnight for a midweek date', () => {
  const result = getStartOfWeek(new Date(2026, 3, 16, 15, 45))

  assert.equal(formatDateInputValue(result), '2026-04-13')
  assert.equal(result.getHours(), 0)
  assert.equal(result.getMinutes(), 0)
  assert.equal(result.getSeconds(), 0)
})

test('getStartOfWeek rolls Sunday back to the previous Monday', () => {
  const result = getStartOfWeek(new Date(2026, 3, 19, 11, 30))
  assert.equal(formatDateInputValue(result), '2026-04-13')
})

test('formatPlannerShortDate keeps a compact day/month format', () => {
  const date = new Date(2026, 0, 5)
  const english = formatPlannerShortDate(date, 'en')
  const vietnamese = formatPlannerShortDate(date, 'vi')

  assert.match(english, /^05\D01$/)
  assert.match(vietnamese, /^05\D01$/)
})

test('openDrawerNextFrame defers the setter to requestAnimationFrame', async () => {
  const callbacks: FrameRequestCallback[] = []
  const original = globalThis.requestAnimationFrame

  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    callbacks.push(callback)
    return 1
  }) as typeof requestAnimationFrame

  let opened = false

  try {
    openDrawerNextFrame((value) => {
      opened = value
    })

    assert.equal(opened, false)
    assert.equal(callbacks.length, 1)

    callbacks[0](0)
    assert.equal(opened, true)
  } finally {
    globalThis.requestAnimationFrame = original
  }
})
