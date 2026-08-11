import test from 'node:test'
import assert from 'node:assert/strict'
import type { PlannerTask } from '../../lib/plannerStorage.ts'
import {
  formatLocalDateKey,
  getPlannerNotificationCandidate,
  getPlannerNotificationKey,
} from './browserNotifications.ts'

function makeTask(overrides: Partial<PlannerTask> = {}): PlannerTask {
  return {
    id: 'task-1',
    title: 'Prepare lesson',
    note: '',
    dueDate: '2026-07-14',
    dueTime: '',
    priority: 'medium',
    repeatPattern: null,
    completed: false,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  }
}

test('formatLocalDateKey uses the local calendar date', () => {
  assert.equal(formatLocalDateKey(new Date(2026, 6, 4, 23, 30)), '2026-07-04')
})

test('an all-day task is notified once it is due today', () => {
  const candidate = getPlannerNotificationCandidate(makeTask(), new Date(2026, 6, 14, 8, 0))
  assert.equal(candidate?.kind, 'today')
})

test('a timed task is notified within the 15-minute window', () => {
  const candidate = getPlannerNotificationCandidate(
    makeTask({ dueTime: '09:00' }),
    new Date(2026, 6, 14, 8, 46),
  )
  assert.equal(candidate?.kind, 'upcoming')
})

test('a timed task is ignored before the reminder window', () => {
  const candidate = getPlannerNotificationCandidate(
    makeTask({ dueTime: '09:00' }),
    new Date(2026, 6, 14, 8, 44),
  )
  assert.equal(candidate, null)
})

test('an unfinished past task is overdue and gets a daily key', () => {
  const now = new Date(2026, 6, 15, 10, 0)
  const candidate = getPlannerNotificationCandidate(makeTask(), now)

  assert.equal(candidate?.kind, 'overdue')
  assert.equal(candidate && getPlannerNotificationKey('user-1', candidate, now), 'user-1:task-1:overdue:2026-07-15')
})

test('completed tasks never produce notifications', () => {
  const candidate = getPlannerNotificationCandidate(
    makeTask({ completed: true }),
    new Date(2026, 6, 14, 8, 0),
  )
  assert.equal(candidate, null)
})
