/****************** 导入 ******************/
import Loader from "./loader";
import Util from "./util";
import Fs from "./fs";
/****************** 导出 ******************/

export default class Music {
  //配置资源目录
  static table = {}
  /**
   * @description 初始化配置表
   * @param data 配置数据{"audio/xx":decodeAudioData}
   */
  static registMusic(data){
    for (let k in data) {
      if(Util.fileSuffix(k) == ".mp3"){
        decodeAudioData(k,data[k]);
        delete data[k];
      }
    }
  }
  /**
   * @description 播放音乐
   */
  static play(path: string,isLoop?: boolean){

  }
  /**
   * @description 暂停音乐
   */
  static stop(path: string){

  }
}
/****************** 本地 ******************/
/**
 * @description 播放缓存
 */
const caches = {};
/**
 * @description 兼容微信
 */
class Source{
  constructor(){
    this.audio = (window as any).wx.createInnerAudioContext();
  }
  audio: any
  _buffer: any
  _loop: boolean
  _src: string
  get buffer(){
    return this._buffer;
  }
  set buffer(val){
    if(this._buffer === val){
      return;
    }
    this._buffer = val;
    this.audio = val;
  }
  get loop(){
    return this._loop;
  }
  set loop(val){
    if(this._loop === val){
      return;
    }
    this._loop = val;
    if(val){
      this.audio.autoplay = true;
      this.audio.loop = true;
    }
  }
  get src(){
    return this._src;
  }
  set src(val){
    if(this._src === val){
      return;
    }
    this._src = val;
    this.audio._src = val;
  }
  start(){
    this.audio.play();
  }
  stop(){
    this.audio.stop();
  }
  pause(){
    this.audio.pause();
  }
}
class WxAudio{
  constructor(){

  }
  decodeAudioData(data: ArrayBuffer,callback: Function){
    callback();
  }
  createBufferSource(){
    return new Source();
  }
}

const autioCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext || WxAudio)();
/**
 * @description 解析音乐资源
 * @param k "app/autio/xx.mp3"
 * @param data ArrayBuffer
 */
const decodeAudioData = (k: string, data: ArrayBuffer): void => {
  autioCtx.decodeAudioData(data, (buff)=>{
    Music.table[k] = buff || Fs.fs.createImg(k);
  })
}

/****************** 立即执行 ******************/
//绑定资源监听
Loader.addResListener("registMusic",Music.registMusic);