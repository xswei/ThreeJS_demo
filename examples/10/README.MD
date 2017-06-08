后期处理是Three.js的一个主要功能

后期处理包括以下几个步骤

- 创建EffectComposer(效果组合器对象),然后在该对象上添加后期处理通道
- 配置该对象，使它可以渲染场景，并应用额外的后期处理步骤
- 在render循环中，使用EffectComposer渲染场景、应用通道并输出结果

### 1. 创建EffectComposer对象

创建`EffectComposer`对象时需要额外引入以下脚本文件:

文件名 | 描述
--- | ---
EffectComposer.js | 提供EffectComposer对象
MaskPass.js | EffectComposer内部使用的文件
ShaderPass.js | EffectComposer内部使用的文件
CopyPass.js | EffectComposer内部使用的文件
RenderPass.js | 用来在EffectComposer对象上添加渲染通道

```js

var composer = new THREE.EffectComposer(webglRenderer);

```

### 2. 配置EffectComposer对象

每个后期通道都会按照其加入EffectComposer的顺序执行，第一个需要加入的是`RenderPass`：

```js

var renderPass = new THREE.RenderPass(scene,camera);	//定义RenderPass对象,定义时需要传入场景和相机对象

composer.addPass(renderPass);	//调用EffectComposer实例的`addPass`方法将其加入到`composer`中

//加入RenderPass之后会渲染场景，但是不会将渲染结果输出到屏幕上，还需要其它设置，下面介绍

```

此外还可以加入其它后期通道，以`FilmPass`为例(自定义的后期通道)的一个完整的例子：

```html
<script src="./FilmPass.js"></script>
<script src="./FilmShader.js"></script>
```

FilmPass.js和FilmShader.js文件用来定义一种胶片效果。非Three.js自带的类。

```js


var renderPass = new THREE.RenderPass(scene,camera);
var filmPass = new THREE.FilmPass(0.8,0.325,256,false);
renderPass.renderToScreen = true;	//设置为true时才会将渲染结果输出到屏幕上

var composer = new THREE.EffectComposer(webglRenderer);

composer.addPass(renderPass);
composer.addPass(filmPass);


```