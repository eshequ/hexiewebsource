// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'
import App from './App'
import router from './router'

import 'babel-polyfill'
import Es6Promise from 'es6-promise'
Es6Promise.polyfill()

/*自己添加的开始  引入mint-ui 和 axios*/
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
import $ from 'jquery'


import axios from 'axios';
//axios.defaults.withCredentials=true; //存储cookie？
import VueAxios from 'vue-axios';
import './assets/css/base.css'
import './assets/css/normalize.css'
import './assets/js/rem.js'

import './assets/font-icon/font_a2awfrh3fuq/iconfont.css'
import cookie from 'js-cookie'

import receiveData from './assets/js/receiveData'
Vue.prototype.receiveData = receiveData;

//本地用
// import {common,MasterConfig} from './assets/js/common';

Vue.prototype.common = common;
Vue.prototype.baseUrl = MasterConfig.C('baseUrl');
Vue.prototype.basePageUrl = MasterConfig.C('basePageUrl');
Vue.prototype.payPageFolder =  MasterConfig.C('payPageFolder');


Vue.prototype.$axios = axios;
Vue.use(MintUI)
//创建axios 实例

var axiosInstance = axios.create({
    transformRequest: [function (data) {
        //data = Qs.stringify(data);
        data = JSON.stringify(data);
        return data;
    }],
    headers: {
        //'Content-Type': 'application/x-www-form-urlencoded',
        //'Content-Type':'application/json;charset=utf-8',
        'Content-Type':"application/json",

        //'Accept': '*/*',
        'Accept': 'application/json',

    },
    baseURL:Vue.prototype.baseUrl,
   
    withCredentials:true,
    transformResponse: [function (data) {//数据转换
      return data;
    }],
});
//创建axios拦截器 给请求头加cookie

axiosInstance.interceptors.request.use(
    config => {
        if( !cookie.get('session')){//没有seesion 判断  暂时跳过直接在首页就存seesion
          
        }else{//在请求头加 session
            config.headers.Cookie =`${ cookie.get('Cookie') }`
        }
        return config
    },
    err => {
        return Promise.reject(err)
    }
)

Vue.use(VueAxios, axiosInstance);


//生产环境提示
Vue.config.productionTip = false
// 开启debug模式
Vue.config.debug = true;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
