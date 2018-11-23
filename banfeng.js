/**
 * banfeng:
 * 
 * 0. 所有对象 的explain()方法为在控制台打印说明
 * 
 * 1. 获取规定格式的日期时间    
 *         Time( data,type ),
 *         this.getTime //属性为最终得到日期时间
 *         // 大写不带0,小写带0 , y m d h i s不再解释
 *         // 除此之外: w-周几,l-毫秒数,t时间戳
 *         
 * 2. 图片压缩上传   
 *         uploadThumbnail({
 *                 url,file,dataType,success:func(d), 
 *                 name:filename,formName:formName,max:[maxWidth,maxHeight] //可选
 *                 // img:图片对象true为base64,false默认为blob
 *         })
 *         this.newImgObj // 属性为压缩后的图片对象
 */


/* 获取带0的日期时间 */
(function(win,undefined){
    var Time = function( date,type ){ // date 时间戳 或者时间对象 type"ymdhis等格式"
        this.getTime = "";
        this.dateT = typeof date;
        this.date = date;
        this.type = type.split( '' );
        this.init();
    }

    Time.prototype = {
        constructor:Time,
        init:function(){
            if( this.dateT =='object' ){
                if( !(this.date instanceof Date) ){
                    return this.getTime = false;
                }
                this.typeAnalytic();
            }else{
                this.date *=1;
                if( (this.date+'').length==10 ){
                    this.date +="000";
                }else if( (this.date+'').length!=13 ){
                    return this.getTime = false;
                }
                this.date = new Date( this.date*1 );
                this.typeAnalytic();
            }

        },
        typeAnalytic:function(){ //解析type
            var i;
            var d = this.date;
            for( i in this.type ){
                switch( this.type[i] ){
                    case "Y":
                    case "y":
                        this.getTime+= d.getFullYear();
                        break;
                    case "m":
                        this.getTime+= this.addZero( d.getMonth()+1 );
                        break;
                    case "M":
                        this.getTime+= d.getMonth()+1;
                        break;
                    case "d":
                        this.getTime+= this.addZero( d.getDate() );
                        break;
                    case "D":
                        this.getTime+= d.getDate();
                        break;
                    case "h":
                    case "H":
                        this.getTime+= this.addZero( d.getHours() );
                        break;
                    case "i":
                        this.getTime+= this.addZero( d.getMinutes() );
                        break;
                    case "I":
                        this.getTime+= d.getMinutes();
                        break;
                    case "s":
                        this.getTime+= this.addZero( d.getSeconds() );
                        break;
                    case "S":
                        this.getTime+= d.getSeconds();
                        break;
                    case "w":
                    case "W":
                        this.getTime+= d.getDay();
                        break;
                    case "l":
                    case "L":
                        this.getTime+= d.getMilliseconds();
                        break;
                    case "T":
                    case "t":
                        this.getTime+= d.getTime();
                        break;
                    default:
                        this.getTime+= this.type[i];
                }
            }
        },
        addZero:function( num ){
            if( num<10 ){
                return '0'+num;
            }else{
                return num;
            }
        },
        explain:function(){
            console.group( "this is new Time" );
            console.log( 'new Time( data,type )' );
            console.log( "obj.getTime:return date" )
            console.groupEnd();
        }
    }
    //把函数 给予window 
    win.Time = Time;
}(window));


/* 图片压缩上传 */
(function(win,undefined){
    'use strict'
    var uploadThumbnail = function( obj ){
        this.newImgObj = null;
        this.init( obj );
        this.success = obj.success || function () {};
    }
    uploadThumbnail.prototype = {
        constructor:uploadThumbnail,
        // 入口函数
        init:function( obj ){
            this.compressPictures( obj );
        },
        // 压缩图片 并将画布传入上传函数
        compressPictures:function( obj ){
            var objThis = this;
            // 压缩图片需要的一些元素和对象
            var reader = new FileReader(), newImg = new Image();
            // 缩放图片需要的canvas
            var canvas = document.createElement( 'canvas' );
            var context = canvas.getContext( '2d' );
            if ( obj.file.type.indexOf( "image" )==0 ) {
                reader.readAsDataURL( obj.file );
                // 文件base64化，以便获知图片原始尺寸
                reader.onload = function( e ) {
                    newImg.src = e.target.result;
                                    // base64地址图片加载完毕后
                    newImg.onload = function () {
                        // 图片原始尺寸
                        var originWidth = this.width;
                        var originHeight = this.height;
                        // 最大尺寸限制
                        var maxWidth, maxHeight;
                        try{
                            maxWidth = obj.max[0];
                            maxHeight = obj.max[1];
                        }catch( err ){
                            maxWidth = 400;
                            maxHeight = 400;
                        }
                        // 目标尺寸
                        var targetWidth = originWidth, targetHeight = originHeight;
                        // 图片尺寸超过400x400的限制
                        if ( originWidth > maxWidth || originHeight > maxHeight ) {
                            if ( originWidth / originHeight > maxWidth / maxHeight ) {
                                // 更宽，按照宽度限定尺寸
                                targetWidth = maxWidth;
                                targetHeight = Math.round( maxWidth * ( originHeight / originWidth ) );
                            } else {
                                targetHeight = maxHeight;
                                targetWidth = Math.round( maxHeight * ( originWidth / originHeight ) );
                            }
                        }
                            
                        // canvas对图片进行缩放
                        canvas.width = targetWidth;
                        canvas.height = targetHeight;
                        // 清除画布
                        context.clearRect( 0,0,targetWidth,targetHeight );
                        // 图片压缩
                        context.drawImage( newImg,0,0,targetWidth,targetHeight);

                        // 完成画布传入上传
                        objThis.upFile( obj,canvas );
                    };
                };
            }else{
                return false;
            }
        },
        upFile:function( obj,canvas ){
            var objThis = this;
            // canvas转为blob并上传
            canvas.toBlob(
                function (blob) {
                    // 生成图片
                    var newImg = document.createElement("img"),
                    url = URL.createObjectURL(blob);
                    newImg.onload = function() {
                        URL.revokeObjectURL(url);
                    };
                    obj.img == true 
                        ? newImg.src = canvas.toDataURL()
                        : newImg.src = url;
                    objThis.newImgObj = newImg;

                    // 创建表单数据
                    var formData = new FormData();
                    formData.append( obj.formName || 'forms',blob,obj.name || 'imgs' );

                    // 图片上传
                    var request  = new XMLHttpRequest();
                    // obj.async ? obj.async = true : obj.async = false;
                    request.open( "POST",obj.url,true );
                    request.send( formData );   
                    request.onreadystatechange = function() {
                        if ( request.readyState == 4 && request.status == 200 ) {
                            if( obj.dataType=="JSON" || obj.dataType=="json" ){
                                try{
                                    objThis.success( JSON.parse(request.responseText) )
                                }catch( err ){
                                    console.info( "banfeng reminds you: Error in converting received data to 'JSON' format" )
                                }
                            }else{
                                objThis.success( request.responseText )
                            }
                        }
                    }; 
                }, 
                file.type || 'image/png',
            );
        },
        explain:function(){
            console.group( "This is uploadThumbnail" );
            console.log( 'new uploadThumbnail({' );
            console.log( '  name:imgFileName || "imgs",' );
            console.log( '  formName:formName || "forms",' );
            console.log( '  max:[maxWidth,maxHeight]  || [ 400*400 ],' );
            console.log( '  file:inputFile,' );
            console.log( '  url:URL,' );
            console.log( '  dataType:"json" || "text"' );
            console.log( '  success:functon(data){} Callback function on success' );
            console.log( '});' );
            console.log( "obj.newImgObj:Compressed image object" );
            console.groupEnd();
        }
    }
    win.uploadThumbnail = uploadThumbnail;
}(window));