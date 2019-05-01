precision highp float;
precision lowp int;
uniform sampler2D uImage;
uniform int uType;
uniform float uTime;
varying vec2 vUv;
void main(){
    vec4 color = vec4(0);
    if(uType == 1||uType == 2){
        float offset = distance(vUv,vec2(0.5,1.0));
        float type = float(uType);
        offset = pow(offset,float(uType+1))/8.0*sin(uTime/type)/type;
        mat2 rotate = mat2(
            cos(offset),-sin(offset),
            sin(offset),cos(offset)
        );
        vec2 cUv = vec2(0.5,1.0)+rotate*(vUv-vec2(0.5,1.0));
        if(cUv.x<0.||cUv.y<0.||cUv.x>1.||cUv.y>1.) discard;
        color = texture2D(uImage,cUv);
    }else{
        color = texture2D(uImage,vUv);
    }
    if(color.a == 0.0){
        discard;
    }
    gl_FragColor = color;
}