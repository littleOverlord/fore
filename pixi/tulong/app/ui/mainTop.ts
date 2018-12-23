export const UiMainTop = {
    type:"container",
    data: {
        id: "top",
        x:0,
        y:0,
        width: 750,
        height: 424
    },
    children: [
        {
            type: "container",
            data: {
                width: 750,
                height: 424,
                x: 0,
                y: 0
            },
            children:[
                {
                    type: "sprite",
                    data: {
                        id: "fightSceneBg",
                        url: "images/ui/scene.png",
                        width: 982,
                        height: 424,
                        x: 0,
                        y: 0
                    },
                    children: [
                        {
                            type: "sprite",
                            data: {
                                url: "images/ui/scene.png",
                                width: 982,
                                height: 424,
                                x: 982,
                                y: 0
                            }
                        }
                    ]
                },
                {
                    type: "container",
                    data: {
                        id: "fightScene",
                        width: 750,
                        height: 424,
                        x: 0,
                        y: 0
                    }
                }
            ]
        },
        {
            type: "sprite",
            data: {
                url: "images/ui/stage_level_bg.png",
                width: 208,
                height: 76,
                x: 271,
                y: 0
            },
            children: [
                {
                    type: "text",
                    data: {
                        id: "stage_level",
                        text: "02-01",
                        x: 64,
                        y: 5,
                        style: {
                            fontFamily : 'Arial', fontSize: 28, fill : "#653013", align : 'center',lineHeight: 36,wordWrap:true,letterSpacing:2,wordWrapWidth: 208
                        }
                    }
                }
            ]
        },
        {
            type: "sprite",
            data: {
                url: "images/ui/token_bg.png",
                width: 134,
                height: 36,
                x: 35,
                y: 15
            },
            children: [
                {
                    type: "sprite",
                    data: {
                        url: "images/ui/token_attack.png",
                        width: 46,
                        height: 46,
                        x: -22,
                        y: -5
                    }
                },
                {
                    type: "text",
                    data: {
                        id: "token_attack",
                        text: "0",
                        x: 34,
                        y: 5,
                        style: {
                            fontFamily : 'Arial', fontSize: 22, fill : "#653013", align : 'left',lineHeight: 36
                        }
                    }
                }
            ]
        },
        {
            type: "sprite",
            data: {
                url: "images/ui/token_bg.png",
                width: 134,
                height: 36,
                x: 35,
                y: 65
            },
            children: [
                {
                    type: "sprite",
                    data: {
                        url: "images/ui/token_hp.png",
                        width: 46,
                        height: 46,
                        x: -22,
                        y: -5
                    }
                },
                {
                    type: "text",
                    data: {
                        id: "token_hp",
                        text: "0",
                        x: 34,
                        y: 5,
                        style: {
                            fontFamily : 'Arial', fontSize: 22, fill : "#653013", align : 'left',lineHeight: 36
                        }
                    }
                }
            ]
        },
        {
            type: "sprite",
            data: {
                url: "images/ui/token_bg.png",
                width: 134,
                height: 36,
                x: 584,
                y: 15
            },
            children: [
                {
                    type: "sprite",
                    data: {
                        url: "images/ui/token_money.png",
                        width: 46,
                        height: 46,
                        x: -22,
                        y: -5
                    }
                },
                {
                    type: "text",
                    data: {
                        id: "token_money",
                        text: "0",
                        x: 34,
                        y: 5,
                        style: {
                            fontFamily : 'Arial', fontSize: 22, fill : "#653013", align : 'left',lineHeight: 36
                        }
                    }
                }
            ]
        },
        {
            type: "sprite",
            data: {
                url: "images/ui/token_bg.png",
                width: 134,
                height: 36,
                x: 584,
                y: 65
            },
            children: [
                {
                    type: "sprite",
                    data: {
                        url: "images/ui/token_diamond.png",
                        width: 46,
                        height: 46,
                        x: -22,
                        y: -5
                    }
                },
                {
                    type: "text",
                    data: {
                        id: "token_diamond",
                        text: "0",
                        x: 34,
                        y: 5,
                        style: {
                            fontFamily : 'Arial', fontSize: 22, fill : "#653013", align : 'left',lineHeight: 36
                        }
                    }
                }
            ]
        }
    ]
}