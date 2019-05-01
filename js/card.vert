precision highp float;
precision lowp int;
uniform mat4 uCameraMatrix;
uniform mat4 uTransformMatrix;
uniform int uType;
uniform float uTime;
attribute vec3 aPosition;
attribute vec2 aUv; 
varying vec2 vUv;
void main(){
    const float scale = 1.0/1.6;
    const mat4 viewAngle = mat4(
        1,0,0,0,
        0,cos(-.1),-sin(-.1),0,
        0,sin(-.1),cos(-.1),0,
        0,-50,-1000,1
    );
    vec3 cPosition = (aPosition)*vec3(scale,scale,-scale);
    if(uType==3){
        cPosition.x += sin(uTime/1.4)*10.;
    }
    gl_Position = uCameraMatrix*viewAngle*(uTransformMatrix*vec4(cPosition.xy,0.0,1.0)+vec4(0,0,cPosition.z,0));
    vUv = aUv;
} 