import OpenGL from "./opengl";
import fragSource from "./card.frag";
import vertSource from "./card.vert";
import {backOut} from 'd3-ease/src/back';
interface webGLParam{
    [key:string]:WebGLUniformLocation|GLint;
}
interface attribData{
    buffer:WebGLBuffer;
    data:Float32Array;
    texture?:WebGLTexture;
    isStand?:boolean;//是否是站立 有旋转效果
    typs?:number;//0 默认 1-小草 2-小树 3-云
}
interface CardOption{
    width:number;
    height:number;
    assets:{
        [key:string]:HTMLImageElement;
    }
}
interface webGLData{
    [key:string]:attribData;
}
export default class Card extends OpenGL{
    gl:WebGLRenderingContext;
    private cardProgram:WebGLProgram;
    private cardParam:webGLParam={};
    private cardData:webGLData=<webGLData>{};
    private prograss:number = 0;
    private rotateMatrix:Float32Array = Card.mat4.create();
    private identityMatrix:Float32Array = Card.mat4.create();
    constructor(canvas:HTMLCanvasElement,option:CardOption){
        super(canvas,option);
        this.cardProgram = Card.initShaderProgram(this.gl,vertSource,fragSource);
        this.getParams();
        this.setParams();
    }
    getParams(){
        //获取参数
        this.gl.useProgram(this.cardProgram);
        this.cardParam.uCameraMatrix = this.gl.getUniformLocation(this.cardProgram,'uCameraMatrix');
        this.cardParam.uTransformMatrix = this.gl.getUniformLocation(this.cardProgram,'uTransformMatrix');
        this.cardParam.uImage = this.gl.getUniformLocation(this.cardProgram,'uImage');
        this.cardParam.uTime = this.gl.getUniformLocation(this.cardProgram,'uTime');
        this.cardParam.uType = this.gl.getUniformLocation(this.cardProgram,'uType');
        this.cardParam.aPosition = this.gl.getAttribLocation(this.cardProgram,'aPosition');
        this.cardParam.aUv = this.gl.getAttribLocation(this.cardProgram,'aUv');
    }
    setParams(){
        //设置参数
        this.gl.useProgram(this.cardProgram);
        let cameraMatrix = Card.mat4.create();
        Card.mat4.perspective(
            cameraMatrix,
            45*(Math.PI/180),
            this.option.width/this.option.height,
            0.1,
            this.option.height
        );
        this.gl.uniformMatrix4fv(this.cardParam.uCameraMatrix,false,cameraMatrix);
        this.gl.uniform1i(this.cardParam.uImage,0);
        this.gl.enableVertexAttribArray(<GLint>this.cardParam.aPosition);
        this.gl.enableVertexAttribArray(<GLint>this.cardParam.aUv);
        //背景
        this.createStandEle('card_background.jpg',[0,0,0]);
        //地面
        this.cardData.ground = {
            buffer:this.gl.createBuffer(),
            data:new Float32Array([
                -670/2,0,-600,  0,1,
                670/2,0,-600,   1,1,
                -670/2,0,0,     0,0,
                670/2,0,0,      1,0
            ]),
            texture:this.gl.createTexture(),
        };
        this.setBindParams(this.cardData.ground,'card_white.jpg');
        //云
        this.createStandEle('card_cloud0.png',[250,505,-5]);
        this.cardData.cloud0.typs = 3;
        //云1
        this.createStandEle('card_cloud1.png',[-140,360,-5]);
        this.cardData.cloud1.typs = 3;
        this.createStandEle('card_tree0.png',[240,0,-10]);
        this.cardData.tree0.typs = 2;
        this.createStandEle('card_tree1.png',[-260,30,-10]);
        this.cardData.tree1.typs = 2;
        this.createStandEle('card_peo0.png',[-150,0,-300]);
        this.createStandEle('card_peo1.png',[-70,0,-360]);
        this.createStandEle('card_peo2.png',[80,0,-370]);
        this.createStandEle('card_peo3.png',[3,0,-400]);
        this.createStandEle('card_peo4.png',[115,0,-420]);
        this.createStandEle('card_grass0.png',[150,0,-450]);
        this.cardData.grass0.typs = 1;
        this.createStandEle('card_grass1.png',[-120,0,-450]);
        this.cardData.grass1.typs = 1;
    }
    createStandEle(file,[x,y,z]){
        //创建站立的元素
        const scale = Math.sqrt((560+z)/560);
        const imgWidth = (<HTMLImageElement>this.option.assets[file]).naturalWidth*scale;
        const imgHeight = (<HTMLImageElement>this.option.assets[file]).naturalHeight*scale;
        const name = file.match(/card\_([^\.]+)/)[1];
        this.cardData[name] = {
            buffer:this.gl.createBuffer(),
            data:new Float32Array([
                x-imgWidth/2,y,z,                      0,1,
                x+imgWidth/2,y,z,                      1,1,
                x-imgWidth/2,y+imgHeight,z,            0,0,
                x+imgWidth/2,y+imgHeight,z,            1,0
            ]),
            texture:this.gl.createTexture(),
            isStand:true,
        };
        this.setBindParams(this.cardData[name],file);
    }
    setBindParams(data:attribData,texture?:string){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,data.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data.data, this.gl.STATIC_DRAW);
        if(data.texture){
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D,data.texture);
            let format = this.gl.RGB;
            if(texture.search(/\.png$/)>=0){
                format = this.gl.RGBA;
            }
            this.gl.texImage2D(this.gl.TEXTURE_2D,0,format,format,this.gl.UNSIGNED_BYTE,this.option.assets[texture]);
            Card.setTexture(this.gl);
        }
    }
    renderBuffer(data:attribData){
        this.gl.useProgram(this.cardProgram);
        if(data.isStand){
            this.gl.uniformMatrix4fv(this.cardParam.uTransformMatrix,false,this.rotateMatrix);
        }else{
            this.gl.uniformMatrix4fv(this.cardParam.uTransformMatrix,false,this.identityMatrix);
        }
        this.gl.uniform1i(this.cardParam.uType,data.typs||0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,data.buffer);
        this.gl.vertexAttribPointer(<GLint>this.cardParam.aPosition,3,this.gl.FLOAT,false,4*5,0);
        this.gl.vertexAttribPointer(<GLint>this.cardParam.aUv,2,this.gl.FLOAT,false,4*5,4*3);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D,data.texture);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4);
    }
    render(timeStamp,offsetTime){
        if(this.cardProgram){
            if(this.prograss<1){
                this.prograss+=offsetTime*.01;
                const rotate = (backOut(this.prograss)-1)*Math.PI/2;
                this.rotateMatrix[5] = this.rotateMatrix[10] = Math.cos(rotate);
                this.rotateMatrix[6] = -Math.sin(rotate);
                this.rotateMatrix[9] = -this.rotateMatrix[6];
            }
            this.gl.uniform1f(this.cardParam.uTime,timeStamp/800);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
            Object.keys(this.cardData).forEach(i=>{
                this.renderBuffer(this.cardData[i]);
            });
        }
        super.render(timeStamp,offsetTime);
    }
}