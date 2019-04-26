/**
 * @description http通讯模块
 */
/****************** 导入 ******************/

/****************** 导出 ******************/
export default class Http {
	/**
	 * @description get请求，可忽略回调
	 */
	static get(url,param,reqType,callback){
		let u = paramPaser(url,param);
		callback = callback || function(){};
		connect(RqType.GET,u[0],u[1],RsType[reqType],callback);
	}
	/**
	 * @description request请求，必须带回调
	 * @param url 
	 * @param param 
	 * @param callback 
	 */
	static request(url,param,callback){
		let u = paramPaser(url,param);
		connect(RqType.GET,u[0],u[1],null,callback);
	}
	/**
	 * @description post请求，一般用作上传
	 */
	static post(url,param,callback,processBack){
		let u = paramPaser(url,param);
		connect(RqType.POST,u[0],u[1],null,callback,processBack);
	}
}
/****************** 本地 ******************/
/**
 * @description 请求类型
 */
enum RqType{
	GET  = "GET",
	POST = "POST"
}
/**
 * @description 响应类型
 */
enum RsType{
	BIN  = "arraybuffer",
	BLOB = "blob",
	DOM  = "document",
	JSON = "JSON",
	TEXT = "text"
}
/**
 * @description 错误处理类
 */
class RsError{
	err = {reson:""}
	constructor(message: string){
		this.err.reson = message
	}
}
/**
 * @description 处理请求参数，返回 "a=b&c=d"
 * @param param 
 */
const paramPaser = (url: string,param: any): string[] => {
	let s = "";
	if(param && typeof param === "object"){
		for(let k in param){
			s += `${s?"&":""}${k}=${typeof param[k] == "object"?JSON.stringify(param[k]):param[k]}`;
		}
	}else{
		s = param || "";
	}
	if(typeof s === "string"){
		url += (url.indexOf("?") > 0)?`&${s}`:`?${s}`;
	}
	return [url,s];
}
/**
 * @description 建立通讯链接
 */
const connect = (type: string, url: string, reqData: any, reqType: string, callback: Function, processBack?: Function) => {
	const xhr = new XMLHttpRequest();
	if(reqType){
		xhr.responseType = 'arraybuffer';
	}
	/**
	 * @description 链接被终止
	 */
	xhr.onabort = () => {
		callback(new RsError("abort"));
	};
	xhr.onerror = (ev) => {
		callback(new RsError(`error status: ${xhr.status} ${xhr.statusText}, ${url}`));
	};
	xhr.upload.onprogress = (ev) => {
		processBack && processBack(ev);
	}
	xhr.onprogress = (ev) => {
		
	}
	xhr.onload = (ev) => {
		if (xhr.status === 300 || xhr.status === 301 || xhr.status === 302 || xhr.status === 303) {
			return callback(new RsError(xhr.getResponseHeader("Location")));
		}
		if (xhr.status !== 200 && xhr.status !== 304) {
			return callback(new RsError(`error status: ${xhr.status} ${xhr.statusText}, ${url}`));
		};
		// console.log(xhr.response);
		// console.log(xhr.responseText);
		callback(null,xhr.response || xhr.responseText);
	}
	xhr.open(type, url, true);
	// if(reqType){
		// xhr.setRequestHeader("accept-encoding", "gzip");
	// }
	xhr.send(reqData);
}