import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en'
import bn from '@/i18n/locales/bn'
import { ERROR_CODES } from '@/api/errors'

function flatten(messages, prefix = '') {
  return Object.entries(messages).flatMap(([key, value]) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

describe('locale parity', () => {
  it('has the same message keys in English and Bangla', () => {
    expect(flatten(en).sort()).toEqual(flatten(bn).sort())
  })

  it('translates every backend error_code in both locales', () => {
    for (const code of ERROR_CODES) {
      expect(en.errors[code]).toBeTypeOf('string')
      expect(bn.errors[code]).toBeTypeOf('string')
    }
  })

  it('does not leave raw @ messages that break the vue-i18n compiler', () => {
    for (const messages of [en, bn]) {
      for (const value of Object.values(messages.errors)) {
        expect(value).not.toMatch(/@(?!\{)/)
      }
    }
  })
})
