/****************** 导入 ******************/

/****************** 导出 ******************/
export class AppUtil{
    /**
    * 矩形区域碰撞检测
    * @param ab {x,y,width,height}
    */
   static Rectangle(a,b){
       var a_x_w = Math.abs((a.x+a.width/2) - (b.x+b.width/2));
       var b_w_w = Math.abs((a.width+b.width)/2);
       var a_y_h = Math.abs((a.y+a.height/2) - (b.y+b.height/2)); 
       var b_h_h = Math.abs((a.height+b.height)/2);
       if( a_x_w < b_w_w && a_y_h < b_h_h ) return true;
       else return false;
   }
   /**
    * @description 计算 !! 为true的元素个数
    * @param o []
    */
   static caclEmptyInObj(o: Array<any>): number{
    let c = 0;
    for(let i = 0, len = o.length; i < len; i++){
        if(!!o[i]){
            c ++;
        }
    }
    return c;
   }
}

/****************** 立即执行 ******************/
