/**
 * @description 前台通讯模块
 */
export default class Connect {
    /**
     * @description 测试接口，供前端测试使用
     */
    static testHandlers = {}
    /**
     * @description 向后台发送请求
     * @param param {type:"",arg:{}}
     * @param callback 请求回调
     */
    static request(param: NetParam,callback: Function): void{
        if(Connect.runTest(param,callback)){
            return ;
        }
    }
    /**
     * @description 向后台发送消息
     * @param param {type:"",arg:{}}
     */
    static send(param: NetParam){}
    /**
     * @description 添加模拟后台数据接口
     * @param type ""
     * @param handler 
     */
    static setTest(type: string,handler: Function): void{
        Connect.testHandlers[type] = handler;
    }
    /**
     * @description 跑测试接口，如果没有，则往服务器发送
     */
    static runTest(param: NetParam,callback: Function): boolean{
        if(Connect.testHandlers[param.type]){
            setTimeout(((func,arg,back) => {
                return ()=>{
                    func(arg,back);
                }
            })(Connect.testHandlers[param.type],param.arg,callback), 0);
            
        }else{
            return false;
        }
        return true;
    }
};
//通讯接口参数
interface NetParam {
    type: string
    arg: {}
}