import { useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { I18nContext, STORAGE_KEY, getInitialLanguage, getNestedValue, interpolate, translateGrade } from '../../i18n'
import type { Language } from '../../types'

function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: Language) => {
        setLanguageState(nextLanguage)
        window.localStorage.setItem(STORAGE_KEY, nextLanguage)
      },
      t: (key: string, params?: Record<string, string | number>) =>
        interpolate(getNestedValue(language, key), params),
      gradeLabel: (grade: Parameters<typeof translateGrade>[0]) => translateGrade(grade, language),
      menuLabel: (menuKey: Parameters<typeof getNestedValue>[1]) =>
        getNestedValue(language, `menu.${menuKey}`),
    }),
    [language],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export default I18nProvider
