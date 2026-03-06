<script lang="ts">
  import { defineComponent, type PropType } from 'vue'
  import { SM4 } from 'gm-crypto'
  import defaultCaptchaImage from './default.jpg'
  import { resetSize } from './utils/util'

  interface CaptchaBlockPuzzleData {
    originBase64?: string
    jigsawBase64?: string
    captchaKey?: string
    [k: string]: unknown
  }

  interface CaptchaBizResponse<T> {
    code?: unknown
    data?: T
    message?: string
  }

  const DEFAULT_SM4_KEY_HEX = '6f889d54ad8c4ddb8c525fc96a185444'

  function sm4EncryptBase64(plainText: string, keyHex: string = DEFAULT_SM4_KEY_HEX): string {
    return SM4.encrypt(plainText, keyHex, {
      inputEncoding: 'utf8',
      outputEncoding: 'base64'
    })
  }

  function isBizSuccess(code: unknown) {
    return code === 0 || code === 200 || String(code) === '0' || String(code) === '200'
  }

  function inferCaptchaImageMimeType(value: string) {
    if (value.startsWith('/9j/')) {
      return 'image/jpeg'
    }
    if (value.startsWith('iVBORw0KGgo')) {
      return 'image/png'
    }
    if (value.startsWith('R0lGOD')) {
      return 'image/gif'
    }
    if (value.startsWith('UklGR')) {
      return 'image/webp'
    }
    if (value.startsWith('PHN2Zy') || value.startsWith('PD94bWwg')) {
      return 'image/svg+xml'
    }

    return null
  }

  function normalizeCaptchaImageSrc(source: string | undefined) {
    const value = source?.trim() ?? ''
    if (!value) {
      return ''
    }

    if (/^(data:|blob:|https?:\/\/|\/\/)/.test(value)) {
      return value
    }

    const mimeType = inferCaptchaImageMimeType(value)
    if (mimeType) {
      return `data:${mimeType};base64,${value}`
    }

    return value
  }

  export default defineComponent({
    name: 'VerifySlide',
    props: {
      loadCaptcha: {
        type: Function as PropType<(params: { captchaKey: string }) => Promise<CaptchaBizResponse<CaptchaBlockPuzzleData>>>,
        required: true
      },
      checkCaptcha: {
        type: Function as PropType<(params: { captcha: string; captchaKey: string }) => Promise<CaptchaBizResponse<unknown>>>,
        required: true
      },
      sm4KeyHex: {
        type: String,
        default: DEFAULT_SM4_KEY_HEX
      },
      captchaType: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        default: '1'
      },
      mode: {
        type: String,
        default: 'fixed'
      },
      vSpace: {
        type: Number,
        default: 5
      },
      explain: {
        type: String,
        default: '拖动滑块完成拼图'
      },
      imgSize: {
        type: Object as () => { width: string, height: string },
        default() {
          return {
            width: '310px',
            height: '155px'
          }
        }
      },
      blockSize: {
        type: Object as () => { width: string, height: string },
        default() {
          return {
            width: '50px',
            height: '50px'
          }
        }
      },
      barSize: {
        type: Object as () => { width: string, height: string },
        default() {
          return {
            width: '310px',
            height: '50px '
          }
        }
      },
      defaultImg: {
        type: String,
        default: defaultCaptchaImage
      }
    },

    emits: ['ready', 'success', 'error', 'closeBox'],

    data() {
      return {
        visible: false,
        passFlag: '' as boolean | '',
        backImgBase: '',
        blockBackImgBase: '',
        captchaKey: '',
        startLeft: 0,
        startMoveTime: 0,
        endMovetime: 0,
        tipWords: '',
        text: '',
        finishText: '',
        setSize: {
          imgHeight: '0px',
          imgWidth: '0px',
          barHeight: '0px',
          barWidth: '0px'
        },
        moveBlockLeft: undefined as string | undefined,
        leftBarWidth: undefined as string | undefined,
        moveBlockClass: '',
        status: false,
        isEnd: false,
        showRefresh: true,
        transitionLeft: '',
        transitionWidth: '',
        onMoveHandler: null as EventListener | null,
        onEndHandler: null as EventListener | null
      }
    },

    computed: {
      barArea(): HTMLElement | null {
        const root = this.$el as HTMLElement | undefined
        if (!root) {
          return null
        }
        return root.querySelector('.verify-bar-area')
      },

      verifyBoxMaxWidth(): string {
        return `${Number.parseInt(this.imgSize.width, 10) + 20}px`
      },

      panelImageSrc(): string {
        return normalizeCaptchaImageSrc(this.backImgBase) || this.defaultImg || ''
      },

      blockImageSrc(): string {
        return normalizeCaptchaImageSrc(this.blockBackImgBase)
      },

      blockPuzzleWidth(): string {
        const width = Number.parseInt(this.setSize.imgWidth || this.imgSize.width, 10)
        const safeWidth = Number.isNaN(width) ? 310 : width
        return `${Math.floor((safeWidth * 47) / 310)}px`
      }
    },

    mounted() {
      ;(this.$el as HTMLElement).onselectstart = () => false
    },

    beforeUnmount() {
      this.unbindEvents()
    },

    methods: {
      async show() {
        await this.refresh()
        await this.init()
      },

      init() {
        this.text = this.explain

        this.$nextTick().then(() => {
          const set = resetSize(this)
          this.setSize.imgHeight = set.imgHeight
          this.setSize.imgWidth = set.imgWidth
          this.setSize.barHeight = set.barHeight
          this.setSize.barWidth = set.barWidth
          this.$emit('ready', this)
        })

        this.unbindEvents()
        this.bindEvents()
      },

      bindEvents() {
        this.onMoveHandler = (event: Event) => {
          this.move(event as MouseEvent | TouchEvent)
        }
        this.onEndHandler = () => {
          void this.end()
        }

        window.addEventListener('touchmove', this.onMoveHandler, {
          passive: false
        })
        window.addEventListener('mousemove', this.onMoveHandler)
        window.addEventListener('touchend', this.onEndHandler)
        window.addEventListener('mouseup', this.onEndHandler)
      },

      unbindEvents() {
        if (this.onMoveHandler) {
          window.removeEventListener('touchmove', this.onMoveHandler)
          window.removeEventListener('mousemove', this.onMoveHandler)
        }
        if (this.onEndHandler) {
          window.removeEventListener('touchend', this.onEndHandler)
          window.removeEventListener('mouseup', this.onEndHandler)
        }
        this.onMoveHandler = null
        this.onEndHandler = null
      },

      getUuid() {
        return `slider-${crypto.randomUUID()}`
      },

      async getPictrue() {
        const res = await this.loadCaptcha({
          captchaKey: this.getUuid()
        })

        if (isBizSuccess(res?.code)) {
          this.visible = true
          this.backImgBase = res.data?.originBase64 || ''
          this.blockBackImgBase = res.data?.jigsawBase64 || ''
          this.captchaKey = res.data?.captchaKey || ''
        }
        else {
          this.tipWords = res?.message || '验证码获取失败'
        }

        if (String(res?.code) === '6201') {
          this.backImgBase = ''
          this.blockBackImgBase = ''
        }
      },

      start(e: MouseEvent | TouchEvent) {
        const event = e || window.event

        let x: number
        if ('touches' in event) {
          event.preventDefault()
          x = event.touches[0]?.pageX ?? 0
        }
        else {
          x = event.clientX
        }

        const barLeft = this.barArea?.getBoundingClientRect().left ?? 0
        this.startLeft = Math.floor(x - barLeft)
        this.startMoveTime = Date.now()

        if (this.isEnd === false) {
          this.text = ''
          this.moveBlockClass = 'move'
          event.stopPropagation()
          this.status = true
        }
      },

      move(e: MouseEvent | TouchEvent) {
        const event = e || window.event
        let x: number

        if (this.status && this.isEnd === false) {
          if ('touches' in event) {
            event.preventDefault()
            x = event.touches[0]?.pageX ?? 0
          }
          else {
            x = event.clientX
          }

          const barAreaLeft = this.barArea?.getBoundingClientRect().left ?? 0
          let moveBlockLeft = x - barAreaLeft

          if (this.barArea) {
            const max
              = this.barArea.offsetWidth - Number.parseInt(String(Number.parseInt(this.blockSize.width, 10) / 2), 10) - 2
            const min = Number.parseInt(String(Number.parseInt(this.blockSize.width, 10) / 2), 10)
            if (moveBlockLeft >= max) {
              moveBlockLeft = max
            }
            if (moveBlockLeft <= 0) {
              moveBlockLeft = min
            }
          }

          this.moveBlockLeft = `${moveBlockLeft - this.startLeft}px`
          this.leftBarWidth = `${moveBlockLeft - this.startLeft}px`
        }
      },

      async end() {
        this.endMovetime = Date.now()

        if (this.status && this.isEnd === false) {
          let moveLeftDistance = Number.parseInt((this.moveBlockLeft || '').replace('px', ''), 10)
          moveLeftDistance = (moveLeftDistance * 310) / Number.parseInt(this.setSize.imgWidth, 10)

          const captcha = sm4EncryptBase64(
            JSON.stringify({
              x: moveLeftDistance,
              y: 0
            }),
            this.sm4KeyHex
          )

          try {
            const res = await this.checkCaptcha({
              captcha,
              captchaKey: this.captchaKey
            })

            if (isBizSuccess(res.code)) {
              this.moveBlockClass = ''
              this.showRefresh = false
              this.isEnd = true

              setTimeout(() => {
                this.visible = false
              }, 1500)

              this.passFlag = true
              this.tipWords = `${((this.endMovetime - this.startMoveTime) / 1000).toFixed(2)}s速度通过验证`

              setTimeout(() => {
                this.tipWords = ''
                this.closeBox()
                this.$emit('success', {
                  captcha,
                  captchaKey: this.captchaKey
                })
              }, 1000)
            }
            else {
              this.moveBlockClass = ''
              this.passFlag = false
              setTimeout(() => this.refresh(), 1000)

              this.tipWords = res.message || '请正确拼合图像'
              setTimeout(() => {
                this.tipWords = ''
              }, 1000)
            }
          }
          catch (err: unknown) {
            this.moveBlockClass = ''
            this.passFlag = false
            setTimeout(() => this.refresh(), 1000)
            this.$emit('error', this)

            const message = err instanceof Error && err.message ? err.message : '请正确拼合图像'
            this.tipWords = message
            setTimeout(() => {
              this.tipWords = ''
            }, 1000)
          }

          this.status = false
        }
      },

      async refresh() {
        this.showRefresh = true
        this.finishText = ''
        this.passFlag = ''

        this.transitionLeft = 'left .3s'
        this.moveBlockLeft = '0px'

        this.leftBarWidth = undefined
        this.transitionWidth = 'width .3s'

        this.moveBlockClass = ''
        this.isEnd = false

        await this.getPictrue()

        setTimeout(() => {
          this.transitionWidth = ''
          this.transitionLeft = ''
          this.text = this.explain
        }, 300)
      },

      closeBox() {
        this.$emit('closeBox')
        this.visible = false
      }
    }
  })
</script>

<template>
  <div id="verify">
    <div v-show="visible" class="mask">
      <div class="verifybox" :style="{ maxWidth: verifyBoxMaxWidth }">
        <div class="verifybox-top">
          <div class="verifybox-stage">
            <div class="verify-img-out" :style="{ height: `${Number.parseInt(setSize.imgHeight, 10) + vSpace}px` }">
              <div
                class="verify-img-panel"
                :class="blockBackImgBase ? '' : 'isDefault'"
                :style="{
                  width: setSize.imgWidth,
                  height: setSize.imgHeight
                }"
              >
                <img :src="panelImageSrc" alt="验证码背景图">
                <div class="verify-refresh" title="刷新验证" @click="refresh" />
                <transition name="tips">
                  <span v-if="tipWords" class="verify-tips" :class="passFlag ? 'suc-bg' : 'err-bg'">{{ tipWords }}</span>
                </transition>
              </div>
            </div>

            <div
              v-show="blockBackImgBase"
              class="verify-bar-area"
              :style="{
                width: setSize.imgWidth,
                height: barSize.height,
                lineHeight: barSize.height
              }"
            >
              <span class="verify-msg">{{ text }}</span>
              <div
                class="verify-left-bar"
                :style="{
                  width: leftBarWidth !== undefined ? leftBarWidth : barSize.height,
                  height: barSize.height,
                  transition: transitionWidth
                }"
              >
                <span class="verify-msg">{{ finishText }}</span>
                <div
                  class="verify-move-block"
                  :class="moveBlockClass"
                  :style="{
                    left: moveBlockLeft,
                    transition: transitionLeft
                  }"
                  @mousedown="start"
                  @touchstart="start"
                >
                  <div
                    class="verify-sub-block"
                    :style="{
                      width: blockPuzzleWidth,
                      height: setSize.imgHeight,
                      top: `-${Number.parseInt(setSize.imgHeight, 10) + vSpace}px`,
                      backgroundSize: `${setSize.imgWidth} ${setSize.imgHeight}`
                    }"
                  >
                    <img :src="blockImageSrc" alt="验证码拼图块">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="verifybox-bottom">
          <div class="verifybox-close" title="关闭验证" @click="closeBox" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  #verify .verifybox {
    position: relative;
    top: 50%;
    left: 50%;
    border-radius: 3px;
    background-color: #fff;
    box-shadow: 0 0 10px rgb(0 0 0 / 30%);
    transform: translate(-50%, -50%);
  }

  #verify .verifybox-top {
    box-sizing: border-box;
    padding: 10px 10px 0;
  }

  #verify .verifybox-stage {
    position: relative;
  }

  #verify .verifybox-close {
    position: absolute;
    top: 13px;
    left: 15px;
    width: 24px;
    height: 24px;
    text-align: center;
    cursor: pointer;
    background-image: url('./operation.png');
    background-repeat: no-repeat;
    background-position-x: 0;
    background-position-y: -178px;
    background-size: 1083.3333%;
  }

  #verify .verifybox-close:hover {
    background-position-x: 0;
    background-position-y: -205px;
  }

  #verify .verifybox-bottom {
    position: relative;
    box-sizing: border-box;
    height: 45px;
    padding: 0 10px;
    border-top: 1px solid #e4e7eb;
    color: #45494c;
    font-size: 16px;
    line-height: 45px;
    text-align: left;
  }

  #verify .mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1001;
    width: 100%;
    height: 100vh;
    background: rgb(0 0 0 / 30%);
    transition: all 0.5s;
  }

  #verify .verify-tips {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 40px;
    color: #fff;
    font-size: 14px;
    line-height: 40px;
    text-indent: 10px;
  }

  #verify .suc-bg {
    background-color: rgb(92 184 92 / 50%);
  }

  #verify .err-bg {
    color: #fff;
    background-color: rgb(217 83 79 / 50%);
  }

  #verify .tips-enter,
  #verify .tips-leave-to {
    bottom: -30px;
  }

  #verify .tips-enter-active,
  #verify .tips-leave-active {
    transition: bottom 0.5s;
  }

  #verify .verify-bar-area {
    position: relative;
    width: 100%;
    height: 0;
    margin: 0 0 5px;
    padding: 0;
    background-image: url('./operation.png');
    background-position: 0 5px;
    background-repeat: no-repeat;
    background-size: 100%;
    color: #88949d;
    font-size: 14px;
    text-align: center;
  }

  #verify .verify-bar-area .verify-move-block {
    position: absolute;
    top: 0;
    left: 0;
    width: 60px;
    height: 60px;
    background-image: url('./operation.png');
    background-position: -3px 360px;
    background-size: 400%;
    cursor: pointer;
    font-size: 0;
    opacity: 1;
    transform: translate(0);
  }

  #verify .verify-bar-area .verify-move-block.move {
    background-position: 0 297px;
  }

  #verify .verify-bar-area .verify-left-bar {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: content-box;
    cursor: pointer;
  }

  #verify .verify-img-panel {
    position: relative;
    box-sizing: content-box;
    margin: 0;
    border-radius: 3px;
  }

  #verify .verify-img-panel img {
    display: block;
    width: 100%;
    height: 100%;
    user-select: none;
  }

  #verify .verify-img-panel .verify-refresh {
    position: absolute;
    bottom: -98px;
    left: 40px;
    z-index: 2;
    width: 24px;
    height: 24px;
    text-align: center;
    cursor: pointer;
    background-image: url('./operation.png');
    background-repeat: no-repeat;
    background-position-x: 0;
    background-position-y: -330px;
    background-size: 1083.3333%;
  }

  #verify .verify-img-panel .verify-refresh:hover {
    background-position-x: 0;
    background-position-y: -357px;
  }

  #verify .verify-img-panel .verify-refresh.points {
    bottom: -48px;
  }

  #verify .verify-img-panel .verify-gap {
    position: relative;
    z-index: 2;
    border: 1px solid #fff;
    background-color: #fff;
  }

  #verify .isDefault .verify-refresh {
    bottom: -43px;
  }

  #verify .verify-bar-area .verify-move-block .verify-sub-block {
    position: absolute;
    z-index: 3;
    text-align: center;
  }

  #verify .verify-bar-area .verify-move-block .verify-sub-block img {
    display: block;
    width: 100%;
    height: 100%;
    user-select: none;
  }

  #verify .verify-bar-area .verify-msg {
    z-index: 3;
    line-height: 40px;
  }

  #verify .verify-bar-area .verify-msg.points {
    display: inline-block;
    padding: 8px 0;
  }
</style>
