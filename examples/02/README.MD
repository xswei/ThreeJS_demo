### 三维空间坐标和地理坐标之间的转换

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

在进行地理坐标转化时候有