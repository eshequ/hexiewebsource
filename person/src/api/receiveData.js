import Vue from 'vue';
let receiveData = {
    /*
     * 微信配置提取的公共方法
     obj须含有以下属性,apilist跟openTagList必须要有一项
     * @param  {objec} vm     [Vue实例]
     * @param  {objec} wx     [微信实例]
     * @param  {array} apilist    [要调用的微信接口]
     * @param  {array} openTagList    [微信开放标签]
     * @param  {string} url     [url地址]
     */
    wxconfig(obj){
        let vm = obj.vm;
        let wx = obj.wx;
        let url = obj.url===undefined?'':obj.url;
        let apilist = obj.apilist===undefined?['scanQRCode']:obj.apilist;
        let openTagList = obj.openTagList===undefined?[]:obj.openTagList;

        vm.axios.post('/getUrlJsSign', {url : url })
            .then(function (res) {
                let a = JSON.parse(res.data)
                let success = a.success;
                if(success===false){
                    // vm.$toast(a.errorCode);
                    return false;
                }
                let wd = a.result  //接口返回的嵌入数据
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: wd.appId, // 必填，公众号的唯一标识
                    timestamp: wd.timestamp, // 必填，生成签名的时间戳
                    nonceStr: wd.nonceStr, // 必填，生成签名的随机串
                    signature: wd.signature,// 必填，签名，见附录1
                    jsApiList: apilist, // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    openTagList:openTagList
                });
            })
            .catch(function (err) {
                //alert('暂放-微信config失败')
                console.log(err);
        });
    },

    // chooseWXPay:function(vm,wx,backdataname){
    //     wx.chooseWXPay({
    //         timestamp: 0, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
    //         nonceStr: '', // 支付签名随机串，不长于 32 位
    //         package: '', // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
    //         signType: '', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
    //         paySign: '', // 支付签名
    //         success: function (res) {
    //          alert
    //         }
    //     })
    // },

    /*微信拍照或从手机相册中选图接口*/
    chooseImage:function(vm,wx,backdataname){
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                    var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
            },
            fail: function (res){
                console.log("网络不稳定 ，请刷新重试！")
            }
        });
    },


    /*
      * 微信扫一扫提取的公共方法
     * @param  {objec} vm     [Vue实例]
     * @param  {objec} wx     [微信实例]
     * @param  {string} backdataname    [接收微信返回的结果]
    */
    scan:function(vm,wx,backdataname){
        wx.scanQRCode({
            needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
            scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
            success: function (res) {
                    //console.log(res.resultStr)
                     var rs = res.resultStr;
                     if(rs.indexOf('CODE')>=0) {
                        rs = rs.split(',')[1];
                     }
                        vm[backdataname] = rs; // 当needResult 为 1 时，扫码返回的结果
                },
            fail: function (res) {
                    //alert('暂放-配置微信扫一扫失败')
                    console.log("网络不稳定 ，请刷新重试！")
                    //alert("网络不稳定 ，请刷新重试！");
                }
        });
    },

    /*
     * 通过axios获取API数据,并将请求回来列表数据，自动装载到Vue实例模板中
     * @param  {objec} vm     [Vue实例]
     * @param  {string} url    [ajax地址]
     * @param  {string} backdataname [存储ajax返回数据的vm节点的key]
     * @params {object} callback  [回调函数]
     * @param  {object} params       [请求参数]
     */
        //请求数据统一的方法
    getData: function (vm, url, backdataname,callback,params) {
        if (typeof (params) == 'undefined' || typeof (params) != 'object') {
            params = {}
        };
        if (backdataname == '' || typeof (backdataname) != 'string') {
            backdataname = 'data';
        };
        vm.axios.get(url, {
                params: params
            })
            .then(function (res){
                let a = JSON.parse(res.data)
                vm[backdataname] = a;
                Vue.prototype.dealWithAjaxData(null,a,function(){},function(){});
                if (typeof (callback) == 'function') {//回调
                    callback()
                }
            })
            .catch(function (err) {
                //alert('暂放-接口调用失败')
                // console.log(err);
            })
    },
   /**
     * post方式提交数据（增加）
     * @param  {object} vm           [vue实例]
     * @param  {string} url          [ajax地址]
     * @param  {object} params       [请求参数]
     * @param  {object} callback     [请求成功后的回调函数]
     */
    postData: function (vm, url, params,backdataname,callback) {
        if (typeof (params) == 'undefined' || typeof (params) != 'object') {
            params = {}
        };
        vm.axios.post(url, params)
            .then(function (res) {

                let a = res.data;
                Vue.prototype.dealWithAjaxData(null,a,function(){},function(){});
                 vm[backdataname] = JSON.parse(a)
                if (typeof (callback) == 'function') {//回调
                        callback()
                }
            })
            .catch(function (err) {
                if(vm.loadingShow){
                    vm.loadingShow = false;
                }
                if(err.message){
                    
                }              
                console.log('fail', err);
            });
    },
};

export default receiveData;