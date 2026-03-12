import { createApp } from 'vue'
import { describe, expect, it } from 'vitest'

import { registerOneUiComponents } from './plugin'

describe('registerOneUiComponents', () => {
  it('默认不全局注册登录组件，但保留业务壳常用组件', () => {
    const app = createApp({})

    registerOneUiComponents(app, {
      prefix: 'Ob',
      aliases: false,
    })

    expect(app.component('ObLoginBox')).toBeUndefined()
    expect(app.component('ObLoginBoxV2')).toBeUndefined()
    expect(app.component('ObPageContainer')).toBeTruthy()
    expect(app.component('ObCard')).toBeTruthy()
  })
})
