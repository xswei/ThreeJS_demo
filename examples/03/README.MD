### 在三维地球上绘制一些点

这部分主要将前面学到的地理投影应用一下，载三维地球上绘制全球机场分布。

### 绘制地球

在绘制地球时，创建一个THREE.Object3D分组对象，用来放置地球和机场。使用分组的目在于将地球和机场放在一起，这样在地球旋转的时候方便同步控制。

```js
var earthRadius = 200;

var earthGroup = new THREE.Object3D();

addEarth(earthGroup,earthRadius);  	//在addEarth函数中向earthGroup添加地球

```

添加地球部分代码:

```js
function addEarth(g,r){
	var sphereGeom = new THREE.SphereGeometry(r,40,40,Math.PI/2);  //注意这里的phiStart参数为Math.PI/2
	var loader = new THREE.TextureLoader();
	loader.load("../images/e2.png",(t)=>{
		let material = new THREE.MeshBasicMaterial({
			map:t
		});
		g.add(new THREE.Mesh(sphereGeom,material));
	})
}

```

### 添加机场

机场数据存放在csv文件中，通过ajax读取即可，这里偷个懒，用d3来加载。

首先引入d3加载csv的模块

```js
<script src="https://d3js.org/d3-collection.v1.min.js"></script>
<script src="https://d3js.org/d3-dispatch.v1.min.js"></script>
<script src="https://d3js.org/d3-dsv.v1.min.js"></script>
<script src="https://d3js.org/d3-request.v1.min.js"></script>

```

接下来也通过一个方法添加机场点,使用粒子系统:

```js
function addPoints(g,r){
	d3.csv("./dataset/airport.csv",(err,csv)=>{
		let pointGeom = new THREE.Geometry();
		csv.forEach((d)=>{
			let lng = parseFloat(d.Longtitude),
				lat = parseFloat(d.Latitude);
			pointGeom.vertices.push(getPos(lng,lat,r+1));
		})
		let pointMaterial = new THREE.PointsMaterial({
			color:0x0ff0cc
		});
		let pointsSystem = new THREE.Points(pointGeom,pointMaterial);
		g.add(pointsSystem);
	})
}

function getPos(v){
	var theta = (v.lng+180)*(Math.PI/180),
		phi = (90-v.lat)*(Math.PI/180),
		radius = v.r;
	return (new THREE.Vector3()).setFromSpherical(new THREE.Spherical(radius,phi,theta));
}

```