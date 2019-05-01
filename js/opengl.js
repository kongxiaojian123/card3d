import mat4 from 'gl-mat4';
const requestAnimationFrame = window.requestAnimationFrame||window.webkitRequestAnimationFrame;
const cancelAnimationFrame = window.cancelAnimationFrame||window.webkitCancelAnimationFrame;
let timer = null;
const fps = 1000/60;
export default class OpenGL{
    static get mat4(){
        return mat4;
    }
    static initOption(canvas,option){
        const bounds = Object.assign({
            left:canvas.offsetLeft,
            top:canvas.offsetTop,
            width:canvas.offsetWidth,
            height:canvas.offsetHeight,
        },canvas.getBoundingClientRect());
        return Object.assign({
            width:bounds.width,
            height:bounds.height,
            offsetLeft:bounds.left,
            offsetTop:bounds.top,
            scale:option.width/bounds.width,
        },option);
    }
    static initGl(canvas,options){
        return canvas.getContext('webgl',options);
    }
    static initShader(gl,type,source){
        const shader = gl.createShader(type);
        gl.shaderSource(shader,source);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
            console.log(`${type === gl.VERTEX_SHADER?'Vert':'Frag'}ShaderInfoLog: ${gl.getShaderInfoLog(shader)}`);
        }
        return shader;
    }
    static initShaderProgram(gl,vsSource,fsSource){
        const program = gl.createProgram();
        gl.attachShader(program,OpenGL.initShader(gl,gl.VERTEX_SHADER,vsSource));
        gl.attachShader(program,OpenGL.initShader(gl,gl.FRAGMENT_SHADER,fsSource));
        gl.linkProgram(program);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
            console.log(`ProgramInfoLog: ${gl.getProgramInfoLog(program)}`);
        }
        return program;
    }
    static initColor(gl){
        //设置背景颜色
        gl.clearColor(0,0,0,0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    static setTexture(gl){
        //设置texture
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    }
    constructor(canvas,option={}){
        this.option = OpenGL.initOption(canvas,option);
        this.canvas = canvas;
        this.canvas.width = this.option.width;
        this.canvas.height = this.option.height;
        this.gl = OpenGL.initGl(this.canvas);
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        // this.gl.enable(this.gl.CULL_FACE);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);
        this.gl.enable(this.gl.DEPTH_TEST);
        // this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,true);
        OpenGL.initColor(this.gl);
        this.destroy();
        this.render();
    }
    render(timeStamp,offsetTime){
        timer = requestAnimationFrame((currentTimeStamp)=>{
            this.render(currentTimeStamp,timeStamp?(currentTimeStamp-timeStamp)/fps:0);
        });
    }
    destroy(){
        cancelAnimationFrame(timer);
        timer = null;
    }
};
