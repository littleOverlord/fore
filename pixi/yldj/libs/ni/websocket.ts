/**
 * @description websocket mod
 */
/****************** 导出 ******************/
export class NetError{
    constructor(public code: number,public reson: string){

    }
}
/**
 * @description 前台通讯模块
 */
export default class Socket {
    constructor(url: string,listener: Function){
        this.url = url;
        this.listener = listener;
        this.open();
    }
    private timeOut = 3000
    private socket: WebSocket
    private url: string
    private listener: Function
    private open(){
        let _this = this;
        this.socket = new WebSocket(this.url);
        setTimeout(()=>{
            if(_this.socket.readyState == WebSocket.CONNECTING){
                _this.listener("open",new NetError(-69,"time out"));
            }
        },this.timeOut)
        this.socket.onopen = function (event: Event) {
            _this.listener("open",null);
        }
        this.socket.onerror = function (event: ErrorEvent) {
            _this.listener("error",event);
        }
        this.socket.onmessage = function (event: MessageEvent) {
            _this.listener("message",event);
        }
        this.socket.onclose = function (event: CloseEvent) {
            _this.listener("close",event);
        }
    }
    /**
     * @description 关闭连接
     * @param code https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
     * @param reason 
     */
    public close(code?: number, reason?: string){
        this.socket.close(code,reason);
    }
    /**
     * @description 发送消息
     * @param data USVString || ArrayBuffer || Blob || ArrayBufferView
     *  https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
     */
    public send(data:any){
        // console.log(data);
        this.socket.send(data);
    }
    /**
     * @description 重新连接socket
     */
    public reopen(){
        this.open();
    }
};
/****************** 本地 ******************/
