export const Locale = {
    FR: 'FR',
    EN: 'EN'
} as const

export type Locale = (typeof Locale)[keyof typeof Locale]
