
$(() => {
    const getUrl = "../data/RemImg/rem.json";
    const throttle = (fn, delay) => {       // 节流
        let flag = true;
        return () => {
            if (flag) {
                setTimeout(() => {
                    fn.call(this);
                    flag = true;
                }, delay);
            }
            flag = false;
        }
    } 
    $(window).on({
        "load": () => {     // window 载入事件
            getImage(15,0)
            setTimeout(() => {
                loadpage();         // 加载重新加载页面
                chageHeight();      // 修改整体高度
                // lazyload();
            },300)
        },
        "resize": () => {   // window 改变窗口事件
            // console.log(1);
            loadpage();      // 加载重新加载页面
            // chageHeight();  // 修改整体高度
        },
        "scroll": throttle(() => {  // window窗口滚动事件
            console.log("滚动节流");
            continueLoad();     // 继续加载
            chageHeight();      // 修改整体高度
        }, 600)
    });

    const clearPosition = () => {   // 清除定位
        $(".imgbox").css({
            "position": "",
            "top": "",
            "left":""
        });
    };
    const lazyload = () => {    // 图片懒加载
        $(".imgbox").each((i,v) => {
            let scrollTop = $(document).scrollTop();
            let winHeight = $(window).height();
            let imgHeight = v.offsetTop
            // 如果 图片顶部距离.box顶部的距离 小于 页面已滚动的长度 + 窗口的高度,就开始加载图片
            if(imgHeight <= scrollTop + winHeight){
                let imgUrl = $(".ksImg").eq(i).attr("data-src");
                // 延时定时器是为了让图片稍微晚一点加载, 做个样子qwq
                setTimeout(() => {``
                    $(".ksImg").eq(i).attr("src",imgUrl);
                },200)
            }
            
        })
    };
    var MaxImgNum = 0;      // 定义一下存放接口图片总数量的变量
    let nextImgNum = 0;     // 定义一下下次滚动的偏移量
    const continueLoad = () => {    // 继续加载
        let winHeight = $(window).height();
        let winScrollTop = $(window).scrollTop();
        let bodyHeight = $(".box").height();
        // 触底判断
        console.log("我到底啦",winHeight,winScrollTop,bodyHeight);
        if(bodyHeight <= winHeight + winScrollTop){
            let limit = 15;
            nextImgNum += 15;
            if(nextImgNum >= MaxImgNum){        // 如果下次添加的偏移量大于图片总量
                // nextImgNum = 0;     // 直接给他打回原形就行了
                // getImage(limit,nextImgNum);     // 获取并添加图片
                // setTimeout(() => {
                //     loadpage();                 // 重新加载页面=v=
                //     chageHeight();              // 然后修改高度 QvQ
                // },300)
                
            }else{
                // 如果下次添加的偏移量不大于最大的数量的情况
                let num1 = limit + nextImgNum;
                // 先判断这次添加图片的数量和偏移量加起来大不大于最大数量
                if(num1 > MaxImgNum){
                    // 然后判断一下,他们相减小不小于0
                    if(num1 - MaxImgNum > 0){
                        // 如果成立的化,就修改一下添加图片的数量
                        limit = limit - (num1 - MaxImgNum);
                    }else{
                        nextImgNum = 0;
                    }
                }
                // 然后添加图片哦!
                getImage(limit,nextImgNum);
                setTimeout(() => {
                    loadpage();
                    chageHeight();
                },300)
            }
        }
    };

    const chageHeight = () => {     // 修改页面的高度
        let bottomMaxImg = getMaxBottomImg();   // 获取最后一行里最高的那个图片
        let maxImg = bottomMaxImg.maxImg
        let maxNum = bottomMaxImg.maxNum
        let oMargin = parseInt($(maxImg).css("margin"));    // 可不能忘了外边距哦!
        let pageHeight = maxNum + maxImg.offsetHeight + oMargin;    // 计算屏幕的总长
        $("#RemApp,.box").css("height",pageHeight + "px");
        lazyload();        // 修改高度后,懒加载一下图片
    };
    
    const getMaxBottomImg = () => {         // 返回最后一行里最长的那个图片,然后返回它的信息
        let imgWidth = $(".imgbox").eq(0).width() + 10;     // +10是因为外边距qwq
        let winWidth = $(".nexmoe-post").width();
        let imgNum = parseInt(winWidth / imgWidth);         // 获取一行元素的列数
        let imgArr = $(".imgbox").toArray();
        let lastImgNum = imgArr.length % imgNum;            // 通过取余来判断最后一行的个数
        if(lastImgNum == 0){                                // 如果余数为 0 说明最后一行是满的 =w=
            lastImgNum = imgNum;
        };

        let maxNum = 0;
        let maxImg = null;
        for(let i = imgArr.length - lastImgNum; i < imgArr.length; i++){        // 只循环最后一行qwq
            if(maxNum < imgArr[i].offsetTop){           // 求出最长的那个图片
                maxNum = imgArr[i].offsetTop;
                maxImg = imgArr[i];
                imgArr[i].offsetTop = maxNum;
            };
        };
        // console.log($(".box").css("margin"),maxNum,maxImg,imgNum);
        return {maxNum: maxNum,maxImg: maxImg};         // 最后返回
    };
    const getImage = (num,offset) => {                  // 通过ajax获取数据
        $.ajax({
            url: getUrl,
            type: "get",
            success: (response) => {
                MaxImgNum = response.length;        // 设置取到的数据数量
                let imgarr = getImgUrl(response);
                outPut(imgarr);
            }
        });
        const getImgUrl = (res) => {        // 获取数据中的图片地址
            let arr = [];
            if(num > res.length){
                num = res.length;
            }
            for(let i = offset; (i-offset) < num; i++){     // 当然是根据偏移量来获取咯qwq
                arr.push(res[i].img_url)
            }
            return arr;
        }
        const outPut = (imgArr) => {        // 输出到页面
            var img = ``;
            // console.log(imgArr);
            imgArr.forEach(element => {
                let oWidth = element.split("?")[1].split("x")[0];
                let oHeight = element.split("?")[1].split("x")[1];
                img += 
                `<div class="imgbox">
                    <div class="content"><img src="./img/loading.gif" data-src="${element.split("?")[0]}" alt="" class="ksImg" width="${oWidth}px" height="${oHeight}px"></div>
                </div>`;
            });
            $(".box").append(img);
        };
    };

    function loadpage(){            // 加载页面
        clearPosition();            // 清除所有定位
        let contArr = [];
        $(".imgbox").each((i) => {
            let imgWidth = $(".imgbox").eq(0).width() + 10;     // 一个图片宽度
            let winWidth = $(".nexmoe-post").width() ;            // 获取大盒子的宽度
            let imgNum = parseInt(winWidth / imgWidth);     // 获取一行图片的个数
            $(".box").width(imgWidth * imgNum +"px");       // 设置大盒子的宽度qwq
            if(i < imgNum){             // 通过判断来获取第一行的图片
                // 然后把他们的高度都取出来,放到一个数组里
                let imgBoxHeight = parseInt($(".imgbox").eq(i).height());
                contArr[i] = imgBoxHeight;
            }else{
                let imgWidth = $(".imgbox").eq(0).width() + 10; // 实时更新数据.
                let minNum = Math.min.apply(null,contArr);      // 获取最短的那个图片
                let minIndex = $.inArray(minNum,contArr);       // 通过最小值,获取最小值的下标
                let position = minIndex * imgWidth;             // 计算出图片居左的位置
                $(".imgbox").eq(i).css({        // 设置样式
                    "position": "absolute",     // 设置绝对居中
                    "top": (minNum + (minNum*0.05))+"px",   // 设置居上的位置
                    "left": position +"px"                  // 设置居左的位置
                });
                //把当前数组里的最小高度，加上本次循环中添加的那个图片的高度
                // 下次循环还会寻找数组中最小的值，然后往最小的的那个下面插入图片
                contArr[minIndex] += $(".imgbox").eq(i).height(); 
            };
        });
    };
    
});