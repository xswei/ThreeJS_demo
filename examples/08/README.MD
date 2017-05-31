### 凹凸贴图

凹凸贴图可以实现具有厚度效果的贴图，厚度的实现是通过额外的贴图实现的，可以是灰度图也可以是彩图，额外的贴图的像素密度定义了凹凸贴图的高度(或者深度)。


```js
function createMesh(geom,texturePath,bumpPath){
	var loader = new THREE.TextureLoader(),
		mat = new THREE.MeshPhongMaterial();
		mesh = new THREE.Mesh(geom,mat);
	loader.load("../images/"+texturePath,(t)=>{
		mat.map = t;
		mesh.material.needsUpdate = true;
	})
	loader.load("../images/"+bumpPath,(b)=>{
		mat.bump = b;
		mat.bumpScale = 0.2;
	})
	return mesh;
}

```

主要利用了材质的`bump`属性(并非所有类材质都有这个属性).