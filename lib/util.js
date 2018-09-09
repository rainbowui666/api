const _ = require("lodash");

module.exports ={
    randomWord(randomFlag, min, max){
        var str = "",
            range = min,
            arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
     
        // 随机产生
        if(randomFlag){
            range = Math.round(Math.random() * (max-min)) + min;
        }
        for(var i=0; i<range; i++){
            pos = Math.round(Math.random() * (arr.length-1));
            str += arr[pos];
        }
        return str;
    },
    buildKey(request){
        const cookies = request.headers.cookie;
        let key = "key";
        if(cookies){
            _.each(cookies.split(";"),(cookie)=>{
                const jid = cookie.split("=")[0];
                const value = cookie.split("=")[1];
                if("JSESSIONID"==_.trim(jid)){
                    key = value;
                }   
            });
        }
        return key;
    },
    trim(s){
        if(s){
            return s.replace(/(^\s*)|(\s*$)/g, "");
        }else{
            return "";
        }
    },
    provinces(){
        const citys = [
            {"code":"sh","name":"上海",'qq':''},
            {"code":"bj","name":"北京",'qq':''},
            {"code":"hn","name":"河南",'qq':''},
            {"code":"js","name":"江苏",'qq':''},
            {"code":"zj","name":"浙江",'qq':''},
            {"code":"tj","name":"天津",'qq':''},
            {"code":"gd","name":"广东",'qq':''},
            {"code":"sd","name":"山东",'qq':''},
            {"code":"he","name":"河北",'qq':''},
            {"code":"fj","name":"福建",'qq':''},
            {"code":"ln","name":"辽宁",'qq':''},
            {"code":"ah","name":"安徽",'qq':''},
            {"code":"cq","name":"重庆",'qq':''},
            {"code":"gx","name":"广西",'qq':''},
            {"code":"gz","name":"贵州",'qq':''},
            {"code":"gs","name":"甘肃",'qq':''},
            {"code":"hl","name":"黑龙江",'qq':''},
            {"code":"hb","name":"湖北",'qq':''},
            {"code":"hu","name":"湖南",'qq':''},
            {"code":"jl","name":"吉林",'qq':''},
            {"code":"nm","name":"内蒙古",'qq':''},
            {"code":"nx","name":"宁夏",'qq':''},
            {"code":"qh","name":"青海",'qq':''},
            {"code":"sx","name":"山西",'qq':''},
            {"code":"sc","name":"四川",'qq':''},
            {"code":"sa","name":"陕西",'qq':''},
            {"code":"xz","name":"西藏",'qq':''},
            {"code":"xj","name":"新疆",'qq':''},
            {"code":"yn","name":"云南",'qq':''},
            {"code":"jx","name":"江西",'qq':''},
        ];
        return citys;
    },
    activity(){
        return [
            {"code":"default","name":"无活动","desc":""},
            {"code":"cx","name":"9月狂欢","desc":""},
            {"code":"jp","name":"精品推荐","desc":""},
        ];
    },
    userTag(){
        return [
            {"code":"default","name":"","desc":""},
            {"code":"rz","name":"认证","desc":""},
            {"code":"jp","name":"精品推荐","desc":""},
        ];
    }
}