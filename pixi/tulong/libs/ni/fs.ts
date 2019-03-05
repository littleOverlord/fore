/****************** 导入 ******************/

/****************** 导出 ******************/
export default class Fs {
	/**
	 * @description 读文件
	 */
	static read(path: string,callback: Function):void{

	}
	/**
	 * @description 写文件
	 * @param path 
	 * @param callback 
	 */
	static write(path: string,callback: Function):void{

	}
}
/****************** 本地 ******************/
declare const wx;
const fs = wx?wx.getFileSystemManager():()=>{};
