export class Fighter{
    constructor(skin,x,y,ani?){
        this.data.url = `images/ani/${skin}.json`;
        this.data.x = x;
        this.data.y = y;
        if(ani){
            this.data.ani = ani;
        }
    }
    type = "animatedSprite"
    data = {
        id: "fighter",
        url:"images/ani/B_S_005.json",
        x:0,
        y:0,
        width: 356,
        height: 356,
        speed: 0.08,
        once: true,
        ani: "standby"
    }
}