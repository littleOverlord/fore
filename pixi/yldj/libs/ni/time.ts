/**
 * @description 控制某个时间段的时间线，暂停将不算时间
 */
/****************** 导入 ******************/

/****************** 导出 ******************/
export default class Time {
	constructor(name){
		this.name = name;
	}
	public name
	/**
	 * @description 暂停时间点
	 */
	private stopTime = 0
	/**
	 * @description 生命周期内总共暂停的时间（ms）
	 */
	private spaceTime = 0
	/**
	 * @description 记录暂停、恢复的次数，每个都要回到0才会生效
	 */
	private count = 0
	/**
	 * @description 获取当前时间点
	 */
	public now(){
		let n = Date.now(),r = n - this.spaceTime;
		if(this.stopTime){
			r -= (n - this.stopTime);
		}
		return r;
	}
	/**
	 * @description 暂停时间,stop && resume必须成对使用
	 */
	public stop(){
		if(this.stopTime == 0){
			this.stopTime = Date.now();
		}
		this.count += 1;
	}
	/**
	 * @description 暂停后恢复,stop && resume必须成对使用
	 */
	public resume(){
		if(this.count == 0){
			return;
		}
		this.count -= 1;
		if(this.count == 0 && this.stopTime > 0){
			this.spaceTime = Date.now() - this.stopTime;
			this.stopTime = 0;
		}
	}
	/**
	 * @description 重置时间，时间则回到正常的自然时间线
	 */
	public reset(){
		this.spaceTime = 0;
		this.stopTime = 0;
		this.count = 0;
	}
	/**
	 * @description 全局时间线
	 */
	static global: Time
}
/****************** 本地 ******************/

/****************** 立即执行 ******************/
Time.global = new Time("global");