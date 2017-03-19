### 三维空间坐标和地理坐标之间的转换

[三维球面坐标](https://en.wikipedia.org/wiki/Spherical_coordinate_system)

为了方便计算和理解，假设球心位于场景中心。

为了将地理经纬度对应到正确的球面坐标上，而球面是由地理贴图渲染的，因此这里的"正确"指的是给定一个地理坐标，能对应到正确的贴图位置。

在地理坐标和三维球面坐标之间进行转换前，先介绍两种坐标系。

### 地理坐标(贴图坐标)

一个完整的地球贴图坐标如下：

![image](https://github.com/xswei/ThreeJS_demo/blob/master/examples/02/ttzb.jpg)

可以看出贴图x方向表示经度，范围[-180(西经),180(东经)]，y轴方向表示维度[90(北纬),-90(南纬)]，因此坐标转化就成了经纬度到球面坐标的转化。

### 球面坐标

在threejs中，一个球有以下重要参数:

- 半径(radius)以及分段数
- 水平方向起始角度(phiStart)
- 水平方向角度大小(phiLength)
- 垂直方向起始角(thetaStart)
- 垂直方向角度大小(thetaLength)

点击这个[例子](https://threejs.org/docs/index.html?q=sphere#Reference/Geometries/SphereGeometry)来直观的理解这几个参数的作用。

在进行地理坐标转化时候有以下先决条件：

- 贴图是一个完整的贴图，[-180,180]，[90,-90]
- 球体是一个完整的球体

那么接下来的工作就是如何对应的问题了

球面坐标是一个三维空间坐标，而贴图上的坐标是二维的，多出来的另一个维度由球的半径决定。

也就是说经纬度只能确定一条原点位于中心点的射线，对应的三维坐标就位于这条射线上，而有了半径则可以确定具体的坐标了。

### 坐标计算

现在要计算phi和theta,球的phi值默认为0，起始点为x轴负方向。theta值默认为0，起始位置为y轴正方向。

![image](https://github.com/xswei/ThreeJS_demo/blob/master/examples/02/zzx.png)


phi的值为0-Math.PI,phi对应的经度范围为-180到180. 那么经纬为lng对应的phi弧度值为(180-lng)*(Math.PI/180)

theta的值为-Math.PI/2到Math.PI/2.theta对应的维度范围为90到-90.维度为lat对应的theta值为(90+lat)*(Math.PI/180)

此时再结合半径和三角函数可以计算出三维坐标

