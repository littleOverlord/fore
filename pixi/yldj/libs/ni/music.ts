/****************** 导入 ******************/
import Loader from "./loader";
import Util from "./util";
import Fs from "./fs";
import Emitter from "./emitter";
/****************** 导出 ******************/

export default class Music {
  static buffs = {}
  //音乐缓存表
  static table = {}
  //背景音乐
  static bgm = ""
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
  static play(path: string,loop?: boolean){
    if(Music.table[path] && Music.table[path].PLAYING_STATE == Music.table[path].playbackState){
      Music.table[path].stop();
    }
    let m = createBufferSource(path);
    if(loop){
      Music.bgm = path;
      if(!m){
        return;
      }
      m.loop = loop;
    }
    try{
      m.start();
      Music.table[path] = m;
    }catch(e){
      console.log(e);
    }
  }
  /**
   * @description 暂停音乐
   */
  static stop(path: string){
    Music.table[path].stop(0);
  }
}
/****************** 本地 ******************/
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
    this.audio.src = val;
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
    Music.buffs[k] = buff || Fs.fs.createImg(k);
    if(Music.bgm && Music.bgm == k && !Music.table[k]){
      Music.play(k,true);
    }
  })
}
const createBufferSource = (k) => {
  if(!Music.buffs[k]){
    return;
  }
  let a = autioCtx.createBufferSource();
    a.buffer = Music.buffs[k];
    a.connect && a.connect(autioCtx.destination);
  return a;
}
/****************** 立即执行 ******************/
//绑定资源监听
Loader.addResListener("registMusic",Music.registMusic);
Emitter.global.add("hide",()=>{
  if(Music.bgm){
    Music.stop(Music.bgm);
  }
});
Emitter.global.add("show",()=>{
  if(Music.bgm){
    Music.play(Music.bgm,true);
  }
})