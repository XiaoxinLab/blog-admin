<template>
    <Particles />
    <div class="custom-message" v-show="messageVisible" :class="messageType">
        <i class="message-icon" :class="messageIconClass"></i>
        <span>{{ messageContent }}</span>
    </div>

    <div class="section" id="particles-js">
        <div class="container">
            <div class="row full-height justify-content-center">
                <div class="col-12 text-center align-self-center py-5">
                    <div class="section pb-5 pt-5 pt-sm-2 text-center" style="z-index: 100;">
                        <div class="logo-wrapper mb-6">
                            <span class="code-logo">
                                &lt;
                                <span class="logo-text">QI</span>
                                <span class="logo-dot">.</span>
                                <span class="logo-text">SUI</span>
                                <span class="logo-dot">.</span>
                                <span class="logo-text">BLOG</span>
                                &gt;
                            </span>
                        </div>
                        <h6 class="mb-0 pb-3">
                            <span>Name Log In </span><span>Phone Log In</span>
                        </h6>
                        <input class="checkbox" type="checkbox" id="reg-log" name="reg-log" />
                        <label for="reg-log" @click="changeLoginType"></label>
                        <div class="card-3d-wrap mx-auto">
                            <div class="card-3d-wrapper">
                                <!-- 用户名登录 -->
                                <div class="card-front">
                                    <div class="center-wrap">
                                        <div class="section text-center">
                                            <h4 class="mb-4 pb-3">Name Log In </h4>
                                            <div class="form-group">
                                                <input type="email" rule="user_name" name="logemail" class="form-style "
                                                    placeholder="Your Name" @blur="verification($event, 'user_name')"
                                                    v-model="userInfo.user_name" id="logemail" autocomplete="off" />
                                                <i class="input-icon uil uil-at"></i>
                                            </div>
                                            <div class="form-group mt-2">
                                                <input type="password" name="logpass" class="form-style"
                                                    placeholder="Your Password"
                                                    @blur="verification($event, 'user_password')"
                                                    v-model="userInfo.user_password" id="logpass" autocomplete="off"
                                                    @keyup.enter="login" />
                                                <i class="input-icon uil uil-lock-alt"></i>
                                            </div>
                                            <a class="btn mt-4" @click.prevent="login" v-loading="loading">登录</a>
                                        </div>
                                    </div>
                                </div>
                                <!-- 手机号登录 -->
                                <div class="card-back">
                                    <div class="center-wrap">
                                        <div class="section text-center">
                                            <h4 class="mb-4 pb-3">Phone Log In</h4>
                                            <div class="form-group">
                                                <input type="text" name="logname" class="form-style"
                                                    placeholder="Your Full Phone" v-model="userInfo.user_phone"
                                                    @blur="verification($event, 'user_phone')" id="logname"
                                                    autocomplete="off" />
                                                <i class="input-icon uil uil-user"></i>
                                            </div>
                                            <div class="form-group mt-2">
                                                <input type="password" name="logpass" class="form-style"
                                                    placeholder="Your Password" v-model="userInfo.user_password"
                                                    @blur="verification($event, 'user_password')" id="logpass"
                                                    autocomplete="off" @keyup.enter="login" />
                                                <i class="input-icon uil uil-lock-alt"></i>
                                            </div>
                                            <a href="#" class="btn mt-4" @click.prevent="login">登录</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Particles from '@/components/particles/index.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api'

const router = useRouter()

const loading = ref(false)
const userInfo = ref({
    user_name: "",
    user_password: "",
    user_phone: ''
})

const isValidate = ref(false)

const messageVisible = ref(false)
const messageContent = ref('')
const messageType = ref('error')

const messageIconClass = computed(() => {
    const iconMap = {
        error: 'uil uil-exclamation-circle',
        success: 'uil uil-check-circle',
        warning: 'uil uil-exclamation-triangle',
        info: 'uil uil-info-circle'
    }
    return iconMap[messageType.value]
})

const showMessage = (content, type = 'error', duration = 3000) => {
    messageContent.value = content
    messageType.value = type
    messageVisible.value = true

    setTimeout(() => {
        messageVisible.value = false
    }, duration)
}

const verification = (e, rule) => {
    const value = e.target.value.trim()
    let isValid = value.length > 0

    const validationRules = {
        user_name: (val) => val.length >= 4 && val.length <= 10,
        user_password: (val) => val.length >= 6 && val.length <= 18,
        user_phone: (val) => /^1[3-9]\d{9}$/.test(val)
    }

    if (rule in validationRules) {
        isValid = isValid && validationRules[rule](value)
    }

    isValidate.value = isValid

    if (!isValid) {
        const errorMessages = {
            user_name: '请输入4-10个字符的用户名',
            user_password: '请输入6-18个字符的密码',
            user_phone: '请输入正确的手机号'
        }

        showMessage(errorMessages[rule], 'error')

        const formGroup = e.target.closest('.form-group')
        if (formGroup) {
            formGroup.classList.add('group-shake')
            setTimeout(() => {
                formGroup.classList.remove('group-shake')
            }, 500)
        }

        e.target.classList.add('is-invalid')
    }

    setTimeout(() => {
        e.target.classList.remove('is-invalid')
    }, 1000)
}

const login = async () => {
    if (!isValidate.value) {
        showMessage('请填写正确登录信息', 'error')
        return
    }

    loading.value = true
    let res

    try {
        if (userInfo.value.user_name) {
            res = await authApi.login({
                user_name: userInfo.value.user_name,
                user_password: userInfo.value.user_password
            })
        } else {
            res = await authApi.loginPhone({
                user_phone: userInfo.value.user_phone,
                user_password: userInfo.value.user_password
            })
        }

        const token = res.result?.token || res.token

        if (token) {
            localStorage.setItem('token', token)
            const userData = res.result?.res || res.result?.user || { 
                user_name: userInfo.value.user_name, 
                is_admin: false,
                is_guest: true
            }
            localStorage.setItem('user', JSON.stringify(userData))

            showMessage('登录成功，即将跳转到首页', 'success')

            setTimeout(() => {
                router.push('/')
            }, 1500)
        } else {
            throw new Error('No token received')
        }
    } catch (err) {
        console.error('Login failed:', err)

        const errorMsg = err.response?.data?.message || err.message || '登录失败，请重试'
        showMessage(errorMsg, 'error')
    } finally {
        setTimeout(() => {
            loading.value = false
        }, 1000)
    }
}

const changeLoginType = () => {
    userInfo.value.user_name = ''
    userInfo.value.user_password = ''
    userInfo.value.user_phone = ''
}
</script>

<style lang="scss" scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.0/css/bootstrap.min.css');
@import url('https://unicons.iconscout.com/release/v2.1.9/css/unicons.css');
@import url('https://fonts.googleapis.com/css?family=Poppins:400,500,600,700,800,900');

.logo-wrapper {
    display: inline-block;
    padding: 14px 32px;
    // background: linear-gradient(135deg, rgba(42, 43, 56, 0.95) 0%, rgba(31, 32, 41, 0.95) 100%);
    border: 1px solid rgba(255, 235, 167, 0.2);
    border-radius: 6px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;

    &:hover {
        border-color: rgba(255, 235, 167, 0.5);
        box-shadow: 0 8px 40px rgba(255, 235, 167, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
        transform: translateY(-2px);
        transition: all 0.3s ease;
    }
}

.code-logo {
    font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
    font-size: 24px;
    font-weight: 500;
    letter-spacing: 3px;
    color: rgba(196, 195, 202, 0.9);

    .logo-text {
        color: #ffeba7;
        text-shadow: 0 0 8px rgba(255, 235, 167, 0.4);
    }

    .logo-dot {
        color: #fff;
        text-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
    }
}

.is-invalid {
    border: 1px solid red !important;
    box-shadow: 0 0 3px red !important;
}

.input-shake {
    border: 1px solid red !important;
    box-shadow: 0 0 3px red !important;
    animation: shake 0.5s ease;
}

.group-shake {
    animation: shake 0.5s ease;
    background-color: rgba(255, 0, 0, 0.05);
    border-radius: 4px;
}

@keyframes shake {
    0% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-5px);
    }

    50% {
        transform: translateX(0px);
    }

    75% {
        transform: translateX(5px);
    }

    100% {
        transform: translateX(0);
    }
}

body {
    font-family: 'Poppins', sans-serif;
    font-weight: 300;
    font-size: 15px;
    line-height: 1.7;
    color: #c4c3ca;
    background-color: #1f2029;
    overflow-x: hidden;
}

a {
    cursor: pointer;
    transition: all 200ms linear;
}

a:hover {
    text-decoration: none;
}

.link {
    color: #c4c3ca;
}

.link:hover {
    color: #ffeba7;
}

p {
    font-weight: 500;
    font-size: 14px;
    line-height: 1.7;
}

h4 {
    font-weight: 600;
    color: #fff;
}

h6 span {
    padding: 0 20px;
    text-transform: uppercase;
    font-weight: 700;
    color: #fff;
}

.section {
    position: relative;
    width: 100%;
    display: block;

    span {
        color: #fff;
    }
}

.full-height {
    min-height: 100vh;
}

[type='checkbox']:checked,
[type='checkbox']:not(:checked) {
    position: absolute;
    left: -9999px;
}

.checkbox:checked+label,
.checkbox:not(:checked)+label {
    position: relative;
    display: block;
    text-align: center;
    width: 60px;
    height: 16px;
    border-radius: 8px;
    padding: 0;
    margin: 10px auto;
    cursor: pointer;
    background-color: #ffeba7;
}

.checkbox:checked+label:before,
.checkbox:not(:checked)+label:before {
    position: absolute;
    display: block;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: #ffeba7;
    background-color: #102770;
    font-family: 'unicons';
    content: '\eb4f';
    z-index: 20;
    top: -10px;
    left: -10px;
    line-height: 36px;
    text-align: center;
    font-size: 24px;
    transition: all 0.5s ease;
}

.checkbox:checked+label:before {
    transform: translateX(44px) rotate(-270deg);
}

.card-3d-wrap {
    position: relative;
    width: 440px;
    max-width: 100%;
    height: 400px;
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d;
    perspective: 800px;
    margin-top: 60px;
}

.card-3d-wrapper {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d;
    transition: all 600ms ease-out;
}

.card-front,
.card-back {
    width: 100%;
    height: 100%;
    background-color: #2a2b38;
    background-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1462889/pat.svg');
    background-position: bottom center;
    background-repeat: no-repeat;
    background-size: 300%;
    position: absolute;
    border-radius: 6px;
    left: 0;
    top: 0;
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d;
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -o-backface-visibility: hidden;
    backface-visibility: hidden;
}

.card-back {
    transform: rotateY(180deg);

    a {}
}

.checkbox:checked~.card-3d-wrap .card-3d-wrapper {
    transform: rotateY(180deg);
}

.center-wrap {
    position: absolute;
    width: 100%;
    padding: 0 35px;
    top: 50%;
    left: 0;
    transform: translate3d(0, -50%, 35px) perspective(100px);
    z-index: 20;
    display: block;
}

.form-group {
    position: relative;
    display: block;
    margin: 0;
    padding: 0;
}

.form-style {
    padding: 13px 20px;
    padding-left: 55px;
    height: 48px;
    width: 100%;
    font-weight: 500;
    border-radius: 4px;
    font-size: 14px;
    line-height: 22px;
    letter-spacing: 0.5px;
    outline: none;
    color: #c4c3ca;
    background-color: #1f2029;
    border: none;
    -webkit-transition: all 200ms linear;
    transition: all 200ms linear;
    box-shadow: 0 4px 8px 0 rgba(21, 21, 21, 0.2);
}

.form-style:focus,
.form-style:active {
    border: none;
    outline: none;
    box-shadow: 0 4px 8px 0 rgba(21, 21, 21, 0.2);
}

.input-icon {
    position: absolute;
    top: 0;
    left: 18px;
    height: 48px;
    font-size: 24px;
    line-height: 48px;
    text-align: left;
    color: #ffeba7;
    -webkit-transition: all 200ms linear;
    transition: all 200ms linear;
}

.form-group input:-ms-input-placeholder {
    color: #c4c3ca;
    opacity: 0.7;
    -webkit-transition: all 200ms linear;
    transition: all 200ms linear;
}

.form-group input::-moz-placeholder {
    color: #c4c3ca;
    opacity: 0.7;
    -webkit-transition: all 200ms linear;
    transition: all 200ms linear;
}

.form-group input:-moz-placeholder {
    color: #c4c3ca;
    opacity: 0.7;
    -webkit-transition: all 200ms linear;
    transition: all 200ms linear;
}

.form-group input::-webkit-input-placeholder {
    color: #c4c3ca;
    opacity: 0.7;
    -webkit-transition: all 200ms linear;
    transition: all 200ms linear;
}

.form-group input:focus:-ms-input-placeholder {
    opacity: 0;
    -webkit-transition: all 200ms linear;
    transition: all 200ms linear;
}

.form-group input:focus::-moz-placeholder {
    opacity: 0;
    -webkit-transition: all 200ms linear;
    transition: all 200ms linear;
}

.form-group input:focus:-moz-placeholder {
    opacity: 0;
    -webkit-transition: all 200ms linear;
    transition: all 200ms linear;
}

.form-group input:focus::-webkit-input-placeholder {
    opacity: 0;
    -webkit-transition: all 200ms linear;
    transition: all 200ms linear;
}

.btn {
    border-radius: 4px;
    height: 44px;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    -webkit-transition: all 200ms linear;
    transition: all 200ms linear;
    padding: 0 30px;
    letter-spacing: 1px;
    display: -webkit-inline-flex;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-align-items: center;
    -moz-align-items: center;
    -ms-align-items: center;
    align-items: center;
    -webkit-justify-content: center;
    -moz-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    text-align: center;
    border: none;
    background-color: #ffeba7;
    color: #102770;
    box-shadow: 0 8px 24px 0 rgba(255, 235, 167, 0.2);
}

.btn:active,
.btn:focus {
    background-color: #102770;
    color: #ffeba7;
    box-shadow: 0 8px 24px 0 rgba(16, 39, 112, 0.2);
}

.btn:hover {
    background-color: #102770;
    color: #ffeba7;
    box-shadow: 0 8px 24px 0 rgba(16, 39, 112, 0.2);
}

.logo {
    position: absolute;
    top: 30px;
    right: 30px;
    display: block;
    z-index: 100;
    transition: all 250ms linear;
}

.logo img {
    height: 26px;
    width: auto;
    display: block;
}

.custom-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    min-width: 280px;
    max-width: 400px;
    padding: 10px 16px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: message-fade-in 0.3s ease;

    &.error {
        background-color: rgba(255, 77, 79, 0.9);
        border: 1px solid #ff4d4f;
        color: white;
    }

    &.success {
        background-color: rgba(82, 196, 26, 0.9);
        border: 1px solid #52c41a;
        color: white;
    }

    &.warning {
        background-color: rgba(250, 173, 20, 0.9);
        border: 1px solid #faad14;
        color: white;
    }

    &.info {
        background-color: rgba(24, 144, 255, 0.9);
        border: 1px solid #1890ff;
        color: white;
    }

    .message-icon {
        margin-right: 8px;
        font-size: 16px;
    }

    span {
        font-size: 14px;
    }
}

@keyframes message-fade-in {
    from {
        opacity: 0;
        transform: translate(-50%, -20px);
    }

    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}

.is-invalid {
    border: 1px solid red !important;
    box-shadow: 0 0 3px red !important;
}

.group-shake {
    animation: shake 0.5s ease;
}

@keyframes shake {
    0% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-5px);
    }

    50% {
        transform: translateX(0px);
    }

    75% {
        transform: translateX(5px);
    }

    100% {
        transform: translateX(0);
    }
}
</style>