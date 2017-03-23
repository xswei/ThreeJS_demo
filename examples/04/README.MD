### 球面圆弧插值

这一部分的目的是在球面上任意两点之间绘制一条最短距离的圆弧线。

在地球球面上绘制弧线的时候遇到了不少问题，也走了不少弯路下面就说一说

### 直接对球面坐标插值(事实证明并不可行)

对球面坐标进行插值是最初的想法，也是最容易想到的，但是是不可行的，下面就来说一下为什么不可行。

#### 对球面坐标插值

球面坐标由phi、theta和radius表示，假设有两个球面坐标v1和v2，插值的基本思想是将phi、theta值从v1线性过渡到v2，然后从中取一系列点组成一个曲线。看起来没啥问题，但是这里有一个很大的陷阱。

球面线性插值可以保证线条在球面是线性过渡的，但是放到三维空间中的时候，问题就出现了，三维空间中的点都使用三维x、y和z表示。也就是最终要绘制的时候要将这一系列点转化为三维空间坐标。转化过程中线条会被扭曲。如下图所示：

![image](https://github.com/xswei/ThreeJS_demo/blob/master/examples/04/p1.png)

上图中蓝色的线条是插值得来的，棕色的是想要的结果。这种扭曲现象在点坐标越靠近南北极越严重。

那么为什么会扭曲？

可以参考地图的经纬度插值来解释，其实对球面坐标插值和对经纬度插值结果是一样的，假设在下图中从v1到v2进行线性插值，那对于平面地图来说是最短的直线(先不考虑插值方向),当把这个平面贴到球面上的时候平面必然会发生变形扭曲(无法避免)，因此直线也同时被扭曲。

![image](https://github.com/xswei/ThreeJS_demo/blob/master/examples/04/p2.png)

因此直接对球面坐标插值是不可行的，对经纬度插值也同理。

#### 那么应该怎么做呢？

在苦恼了几天之后恍然大悟，向量是个好东西，向量是个好东西，向量是个好东西，重要的事情说三遍

使用向量插值的时候要必须要明确一点，那就是空间中两个向量可以确定一个唯一平面。有了这个立场之后就可以将三维空间的向量运算放到二维空间中，其实都是同一个道理。

`因此用向量插值可以保证中间的一系列点和起止点都位于同一个平面`。

因此问题就成了在两个等长的向量之间插值，获取之间等长的一些列点，如下图在红弧线上获取一些中间点:

![image](https://github.com/xswei/ThreeJS_demo/blob/master/examples/04/p3.png)

插值过程是一个不断获取中间点的递归过程：

##### 第一次插值

第一次插值，可以得到v1和v2的平分线上一点p1, 首先计算v1+v2，由于v1长度与v2相等，所以p1肯定位于v1+v2上。在计算出来v1+v2之后乘以一个缩放系数就可以得到p1。缩放系数可以由长度获取。

![image](https://github.com/xswei/ThreeJS_demo/blob/master/examples/04/p4.png)

此时已经可以获取到一个中间点

##### 第二次插值

第二次插值与第一次类似，只不过多了一次，分别在v1-p1和v2-p1之间插值。如下图

![image](https://github.com/xswei/ThreeJS_demo/blob/master/examples/04/p5.png)

第二次插值可以获取到3个中间点。

##### 第三次插值

第三次插值可以获取到7个中间点，如下图

![image](https://github.com/xswei/ThreeJS_demo/blob/master/examples/04/p6.png)

第三次插值后共获取到7个中间点。

以此类推

要格外注意插值次数不能太多，注意到这种插值方法第n次插值会获取2的n次方减1个中间点，会随着插值次数增加呈指数增长。

在经过上述插值之后，可以得到一系列等分的点，这些点位于圆弧上。

##### 实现过程

首先声明一个对象:

```js
var v1 = getPos({
	lng:360*Math.random()-180,
	lat:180*Math.random()-90,
	r:earthRadius+10
}),v2 = getPos({
	lng:360*Math.random()-180,
	lat:180*Math.random()-90,
	r:earthRadius+10
});

var line = {
	v1:v1,
	v2:v2,
	vertices:[v1,v2],
	nums:5
}

```

line为需要插值的对象，包含v1和v2两个坐标，以及用来存放插值结果的vertices数组，nums用来表示插值次数


#### 插值函数的实现

定义一个函数实现插值过程，并返回结果，

```js
function interVector3(l){
	if(l.v1.angleTo(l.v2)==0) return l;		// 1
	if(l.v1.angleTo(l.v2)==Math.PI) l.v1.x--;  	// 2
	for(let i=0;i<l.nums;++i){
		let newArr = [],
			j = 0;
		do{
			let newV,
				v_t1 = (new THREE.Vector3()).copy(l.vertices[j]),  // 3
				v_t2 = (new THREE.Vector3()).copy(l.vertices[j+1]),
				m = v_t1.length()/v_t2.add(v_t1).length();  	// 4
			newV = v_t1.add(l.vertices[j+1]).multiplyScalar(m);
			newArr.push((new THREE.Vector3()).copy(l.vertices[j]));
			newArr.push((new THREE.Vector3()).copy(newV));
			j++;
		}while(j<l.vertices.length-1)
		newArr.push((new THREE.Vector3()).copy(l.vertices[j]));
		l.vertices = newArr;
	}
	return l;
}

```

- 1：两个点重叠
- 2: 两个点正好相反，相差180度，将其中一个坐标稍微调整
- 3: 这里做两个副本，是因为在对向量进行add运算时会改变其值
- 4: m为所求的系数，做缩放用

