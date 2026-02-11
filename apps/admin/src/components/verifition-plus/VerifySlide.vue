<script lang="ts">
import { defineComponent } from 'vue';
import { resetSize } from './utils/util';
import { reqCheck, reqGet } from './api/code';
import { sm4EncryptBase64 } from '@/infra/sczfw/crypto';

export default defineComponent({
  name: 'VerifySlide',
  props: {
    captchaType: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: '1'
    },
    // 弹出式 pop，固定 fixed
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
      type: Object as () => { width: string; height: string },
      default() {
        return {
          width: '310px',
          height: '155px'
        };
      }
    },
    blockSize: {
      type: Object as () => { width: string; height: string },
      default() {
        return {
          width: '50px',
          height: '50px'
        };
      }
    },
    barSize: {
      type: Object as () => { width: string; height: string },
      default() {
        return {
          width: '310px',
          height: '50px '
        };
      }
    },
    defaultImg: {
      type: String,
      default: ''
    }
  },
  emits: ['ready', 'success', 'error', 'closeBox'],
  data() {
    return {
      visible: false,
      passFlag: '' as '' | boolean, // 是否通过的标识
      backImgBase: '', // 验证码背景图片
      blockBackImgBase: '', // 验证滑块的背景图片
      captchaKey: '', // 验证码标识
      startLeft: 0,
      startMoveTime: 0, // 移动开始的时间
      endMovetime: 0, // 移动结束的时间
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
      status: false, // 鼠标状态
      isEnd: false, // 是否验证完成
      showRefresh: true,
      transitionLeft: '',
      transitionWidth: '',

      // 为了保证 removeEventListener 生效，这里缓存 handler 引用
      onMoveHandler: null as EventListener | null,
      onEndHandler: null as EventListener | null
    };
  },
  computed: {
    barArea(): HTMLElement | null {
      const root = this.$el as HTMLElement | undefined;
      if (!root) return null;
      return root.querySelector('.verify-bar-area');
    }
  },
  mounted() {
    // 禁止拖拽选中文本
    (this.$el as HTMLElement).onselectstart = () => false;
  },
  beforeUnmount() {
    this.unbindEvents();
  },
  methods: {
    async show() {
      await this.refresh();
      await this.init();
    },
    init() {
      this.text = this.explain;

      this.$nextTick(() => {
        const set = resetSize(this); // 重新设置宽度高度
        this.setSize.imgHeight = set.imgHeight;
        this.setSize.imgWidth = set.imgWidth;
        this.setSize.barHeight = set.barHeight;
        this.setSize.barWidth = set.barWidth;
        this.$emit('ready', this);
      });

      this.unbindEvents();
      this.bindEvents();
    },
    bindEvents() {
      this.onMoveHandler = (e: Event) => {
        this.move(e as MouseEvent | TouchEvent);
      };
      this.onEndHandler = () => {
        void this.end();
      };

      window.addEventListener('touchmove', this.onMoveHandler, { passive: false });
      window.addEventListener('mousemove', this.onMoveHandler);
      window.addEventListener('touchend', this.onEndHandler);
      window.addEventListener('mouseup', this.onEndHandler);
    },
    unbindEvents() {
      if (this.onMoveHandler) {
        window.removeEventListener('touchmove', this.onMoveHandler);
        window.removeEventListener('mousemove', this.onMoveHandler);
      }
      if (this.onEndHandler) {
        window.removeEventListener('touchend', this.onEndHandler);
        window.removeEventListener('mouseup', this.onEndHandler);
      }
      this.onMoveHandler = null;
      this.onEndHandler = null;
    },
    getUuid() {
      return `slider-${crypto.randomUUID()}`;
    },
    async getPictrue() {
      const data = {
        captchaKey: this.getUuid()
      };

      const res = await reqGet(data);

      if (res?.code === 200) {
        this.visible = true;
        this.backImgBase = res.data?.originBase64 || '';
        this.blockBackImgBase = res.data?.jigsawBase64 || '';
        this.captchaKey = res.data?.captchaKey || '';
      } else {
        this.tipWords = res?.message || '验证码获取失败';
      }

      // 判断接口请求次数是否失效
      if (String(res?.code) === '6201') {
        this.backImgBase = '';
        this.blockBackImgBase = '';
      }
    },
    // 鼠标按下
    start(e: MouseEvent | TouchEvent) {
      const event = e || window.event;

      let x: number;
      if (!('touches' in event)) {
        x = event.clientX;
      } else {
        x = event.touches[0]?.pageX ?? 0;
      }

      const barLeft = this.barArea?.getBoundingClientRect().left ?? 0;
      this.startLeft = Math.floor(x - barLeft);
      this.startMoveTime = Date.now();

      if (this.isEnd === false) {
        this.text = '';
        this.moveBlockClass = 'move';
        event.stopPropagation();
        this.status = true;
      }
    },
    // 鼠标移动
    move(e: MouseEvent | TouchEvent) {
      const event = e || window.event;
      let x: number;

      if (this.status && this.isEnd === false) {
        if (!('touches' in event)) {
          x = event.clientX;
        } else {
          x = event.touches[0]?.pageX ?? 0;
        }

        const barAreaLeft = this.barArea?.getBoundingClientRect().left ?? 0;
        let moveBlockLeft = x - barAreaLeft;

        if (this.barArea) {
          const max =
            this.barArea.offsetWidth - parseInt(String(parseInt(this.blockSize.width) / 2)) - 2;
          const min = parseInt(String(parseInt(this.blockSize.width) / 2));
          if (moveBlockLeft >= max) moveBlockLeft = max;
          if (moveBlockLeft <= 0) moveBlockLeft = min;
        }

        this.moveBlockLeft = `${moveBlockLeft - this.startLeft}px`;
        this.leftBarWidth = `${moveBlockLeft - this.startLeft}px`;
      }
    },
    // 鼠标松开
    async end() {
      this.endMovetime = Date.now();

      if (this.status && this.isEnd === false) {
        let moveLeftDistance = parseInt((this.moveBlockLeft || '').replace('px', ''));
        // 310 为后端验证码生成时的基准宽度，保持与老项目一致
        moveLeftDistance = (moveLeftDistance * 310) / parseInt(this.setSize.imgWidth);

        const captcha = sm4EncryptBase64(JSON.stringify({ x: moveLeftDistance, y: 0 }));
        const data = {
          captcha,
          captchaKey: this.captchaKey
        };

        try {
          const res = await reqCheck(data);
          if (res.code === 200) {
            this.moveBlockClass = '';
            this.showRefresh = false;
            this.isEnd = true;

            setTimeout(() => {
              this.visible = false;
            }, 1500);

            this.passFlag = true;
            this.tipWords = `${((this.endMovetime - this.startMoveTime) / 1000).toFixed(2)}s速度通过验证`;

            setTimeout(() => {
              this.tipWords = '';
              this.closeBox();
              this.$emit('success', { captcha, captchaKey: this.captchaKey });
            }, 1000);
          } else {
            this.moveBlockClass = '';
            this.passFlag = false;
            setTimeout(() => this.refresh(), 1000);

            this.tipWords = res.message || '请正确拼合图像';
            setTimeout(() => {
              this.tipWords = '';
            }, 1000);
          }
        } catch (err: unknown) {
          this.moveBlockClass = '';
          this.passFlag = false;
          setTimeout(() => this.refresh(), 1000);
          this.$emit('error', this);

          const message = err instanceof Error && err.message ? err.message : '请正确拼合图像';
          this.tipWords = message;
          setTimeout(() => {
            this.tipWords = '';
          }, 1000);
        }

        this.status = false;
      }
    },
    async refresh() {
      this.showRefresh = true;
      this.finishText = '';

      this.transitionLeft = 'left .3s';
      this.moveBlockLeft = '0px';

      this.leftBarWidth = undefined;
      this.transitionWidth = 'width .3s';

      this.moveBlockClass = '';
      this.isEnd = false;

      await this.getPictrue();

      setTimeout(() => {
        this.transitionWidth = '';
        this.transitionLeft = '';
        this.text = this.explain;
      }, 300);
    },
    closeBox() {
      this.$emit('closeBox');
      this.visible = false;
    }
  }
});
</script>

<template>
  <div id="verify">
    <div v-show="visible" class="mask">
      <div class="verifybox" :style="{ 'max-width': parseInt(imgSize.width) + 20 + 'px' }">
        <div class="verifybox-top">
          <div style="position: relative">
            <div :style="{ height: parseInt(setSize.imgHeight) + vSpace + 'px' }" class="verify-img-out">
              <div
                :style="{ width: setSize.imgWidth, height: setSize.imgHeight }"
                class="verify-img-panel"
                :class="blockBackImgBase ? '' : 'isDefault'"
              >
                <img
                  :src="backImgBase ? 'data:image/png;base64,' + backImgBase : defaultImg"
                  alt=""
                  style="display: block; width: 100%; height: 100%"
                >
                <div class="verify-refresh" title="刷新验证" @click="refresh" />
                <transition name="tips">
                  <span v-if="tipWords" class="verify-tips" :class="passFlag ? 'suc-bg' : 'err-bg'">{{ tipWords }}</span>
                </transition>
              </div>
            </div>

            <div
              v-show="blockBackImgBase"
              class="verify-bar-area"
              :style="{ width: setSize.imgWidth, height: barSize.height, 'line-height': barSize.height }"
            >
              <span class="verify-msg" v-text="text" />
              <div
                class="verify-left-bar"
                :style="{
                  width: leftBarWidth !== undefined ? leftBarWidth : barSize.height,
                  height: barSize.height,
                  transition: transitionWidth
                }"
              >
                <span class="verify-msg" v-text="finishText" />
                <div
                  class="verify-move-block"
                  :class="moveBlockClass"
                  :style="{ left: moveBlockLeft, transition: transitionLeft }"
                  @mousedown="start"
                  @touchstart="start"
                >
                  <div
                    class="verify-sub-block"
                    :style="{
                      width: Math.floor((parseInt(setSize.imgWidth) * 47) / 310) + 'px',
                      height: setSize.imgHeight,
                      top: '-' + (parseInt(setSize.imgHeight) + vSpace) + 'px',
                      'background-size': setSize.imgWidth + ' ' + setSize.imgHeight
                    }"
                  >
                    <img
                      :src="'data:image/png;base64,' + blockBackImgBase"
                      alt=""
                      style="display: block; width: 100%; height: 100%"
                    >
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
  border-top: 1px solid #e4e7eb;
  padding: 0 10px;
  height: 45px;
  font-size: 16px;
  text-align: left;
  color: #45494c;
  box-sizing: border-box;
  line-height: 45px;
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
  font-size: 14px;
  text-indent: 10px;
  color: #fff;
  line-height: 40px;
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
  margin: 0 0 5px;
  padding: 0;
  width: 100%;
  height: 0;
  font-size: 14px;
  text-align: center;
  color: #88949d;
  background-position: 0 5px;
  background-repeat: no-repeat;
  background-size: 100%;
  background-image: url('./operation.png');
}

#verify .verify-bar-area .verify-move-block {
  position: absolute;
  top: 0;
  left: 0;
  width: 60px;
  height: 60px;
  font-size: 0;
  cursor: pointer;
  background-image: url('./operation.png');
  background-position: -3px 360px;
  background-size: 400%;
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

#verify .verify-bar-area .verify-msg {
  z-index: 3;
  line-height: 40px;
}

#verify .verify-bar-area .verify-msg.points {
  display: inline-block;
  padding: 8px 0;
}
</style>
