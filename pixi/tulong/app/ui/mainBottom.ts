export const UiMainBottom = {
    type:"container",
    data: {
        id: "bottom",
        x:0,
        y:424,
        width: 750,
        height: 920
    },
    children: [
        {
            type: "sprite",
            data: {
                url: "images/ui/bag_bg.png",
                width: 750,
                height: 920,
                x: 0,
                y: 0
            }
        },
        {
            type: "container",
            data: {
                width: 250,
                height: 114,
                x: 250,
                y: 50
            },
            children: [
                {
                    type: "sprite",
                    data: {
                        id: "bag_tab_attack",
                        url: "images/ui/bag_tab_bg.png",
                        width: 114,
                        height: 114,
                        x: 0,
                        y: 0
                    },
                    children: [
                        {
                            type: "sprite",
                            data: {
                                url: "images/ui/bag_tab_attack.png",
                                width: 70,
                                height: 70,
                                x: 22,
                                y: 22
                            }
                        }
                    ]
                },
                {
                    type: "sprite",
                    data: {
                        id: "bag_tab_armors",
                        url: "images/ui/bag_tab_bg.png",
                        width: 114,
                        height: 114,
                        x: 136,
                        y: 0
                    },
                    children: [
                        {
                            type: "sprite",
                            data: {
                                url: "images/ui/bag_tab_armors.png",
                                width: 70,
                                height: 70,
                                x: 22,
                                y: 22
                            }
                        }
                    ]
                }
            ]
        },
        {
            type: "sprite",
            data: {
                id: "button_store",
                url: "images/ui/button_store.png",
                width: 136,
                height: 100,
                x: 100,
                y: 770
            },
            children: [
                {
                    type: "text",
                    data: {
                        text: "商店",
                        style: {fontSize:30,fill:"#adbbd9",strokeThickness:2},
                        x: 34,
                        y: 25
                    }
                }
            ]
        },
        {
            type: "sprite",
            data: {
                id: "fast_buy",
                url: "images/ui/button_buy.png",
                width: 214,
                height: 100,
                x: 275,
                y: 770
            },
            children: [
                {
                    type: "text",
                    data: {
                        id: "fast_buy_level",
                        text: "LV.8",
                        style: {fontSize:26,fill:"#adbbd9",strokeThickness:2},
                        x: 54,
                        y: 15
                    }
                },
                {
                    type: "sprite",
                    data: {
                        id: "button_buy",
                        url: "images/ui/token_money.png",
                        width: 26,
                        height: 26,
                        x: 30,
                        y: 50
                    },
                },
                {
                    type: "text",
                    data: {
                        id: "fast_buy_money",
                        text: "265555",
                        style: {fontSize:26,fill:"#e4b349",strokeThickness:2},
                        x: 60,
                        y: 45
                    }
                }
            ]
        },
        {
            type: "sprite",
            data: {
                id: "button_sale",
                url: "images/ui/button_sale.png",
                width: 136,
                height: 100,
                x: 524,
                y: 770
            },
            children: [
                {
                    type: "text",
                    data: {
                        text: "出售",
                        style: {fontSize:30,fill:"#d9c6ad",strokeThickness:2},
                        x: 34,
                        y: 25
                    }
                }
            ]
        }
    ]
}