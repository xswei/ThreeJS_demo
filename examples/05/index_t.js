window.onload = ()=>{
	var mapDiv = document.querySelector("#map"),
		width = mapDiv.clientWidth,
		height = mapDiv.clientHeight;

	var earthRadius = 150;

	var stats = initStats();
	document.querySelector("#stats").appendChild(stats.domElement);

	
	var scene = new THREE.Scene();

	var renderer = new THREE.WebGLRenderer();
	//renderer.setClearColor(0xffffff,0);
	renderer.setSize(width,height);

	var camera = new THREE.PerspectiveCamera(45,width/height,0.1,1000);
	camera.position.x = -earthRadius+300;
	camera.position.y = 300;
	camera.position.z = earthRadius+300;
	camera.lookAt(scene.position);
	
	var orbit = new THREE.OrbitControls(camera,renderer.domElement);
		
	scene.add(new THREE.AxisHelper(200))

	earthGroup = new THREE.Object3D();
	scene.add(earthGroup);
	//addAxis(scene,earthRadius+50);*/
	addEarth(earthGroup,earthRadius,"earth");
	earthGroup.rotation.y = 1;

	

	
	
	var v1 = getPos({
		lng:360*Math.random()-180,
		lat:180*Math.random()-90,
		r:earthRadius
	}),v2 = getPos({
		lng:360*Math.random()-180,
		lat:180*Math.random()-90,
		r:earthRadius
	});
	
	line = {
		v1:v1,
		v2:v2,
		vertices:[v1,v2],
		nums:3
	}

	interVector3(line,3);

	document.querySelector("#map").append(renderer.domElement)

	render();


	function render(){
		stats.update();
		orbit.update();
		//updateLines(lines);
		/*for(var j=0;j<lines.length;++j){
			var l = lines[j];
			l.geometry.index++;
			if(l.geometry.index>=l.geometry.v.length-1){
				l.geometry.index = 0;
				l.geometry.vertices = new Array(0);
				l.geometry.verticesNeedUpdate = true;
			}
			l.geometry.vertices.push(l.geometry.v[l.geometry.index]);
			l.geometry.verticesNeedUpdate = true;
			l.material.needsUpdate = true;
		}*/
		//earthGroup.rotation.y += 0.003;
		renderer.render(scene,camera);
		requestAnimationFrame(render);
		//setTimeout(render,500)
	}
}
function initStats(){
	var s = new Stats();
	s.domElement.style.position = "absolute";
	s.domElement.style.left = "10px";
	s.domElement.style.top = "10px";
	return s;
}

function addAxis(s,l){
	s.add(new THREE.AxisHelper(l));
}
function addEarth(s,r,str){

	var group = new THREE.Object3D();

	var sphereGeom = new THREE.SphereGeometry(r,40,40,Math.PI/2);
	/*var sphereMaterial = new THREE.MeshBasicMaterial({
		color:0xeeeeee
	});
	var sphereMesh = new THREE.Mesh(sphereGeom,sphereMaterial);

	var lineMaterial = new THREE.MeshBasicMaterial({
		color:0x000000,
		wireframe:true
	})
	var lineMesh = new THREE.Mesh(sphereGeom,lineMaterial);*/
	var loader = new THREE.TextureLoader();
	loader.load("./images/e4.jpg",(t)=>{
		let material = new THREE.MeshBasicMaterial({
			map:t
		});
		group.name = str;
		group.add(new THREE.Mesh(sphereGeom,material));
	})
	//group.add(lineMesh);
	//group.add(sphereMesh);	
	s.add(group);
}

function getPos(v){
	var theta = (v.lng+180)*(Math.PI/180),
		phi = (90-v.lat)*(Math.PI/180),
		radius = v.r;
	return (new THREE.Vector3()).setFromSpherical(new THREE.Spherical(radius,phi,theta));
}


function addPoints(g,r){
	d3.csv("./dataset/airport.csv",(err,csv)=>{
		console.log(csv);
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







function interP(p1,p2,step){
	var t = 0,
		lineGeom = new THREE.Geometry();
	lineGeom.vertices.push(getPosFromSpherical(p1.r,p1.phi,p1.theta));
	lineGeom.vertices.push(getPosFromSpherical(p1.r+5,p1.phi,p1.theta));
	while(t<=1){
		lineGeom.vertices.push(getPosFromSpherical(p1.r+5,(p2.phi-p1.phi)*t+p1.phi,(p2.theta-p1.theta)*t+p1.theta))
		t+=step;
	}
	lineGeom.vertices.push(getPosFromSpherical(p2.r+5,p2.phi,p2.theta));
	lineGeom.vertices.push(getPosFromSpherical(p2.r,p2.phi,p2.theta));
	console.log(lineGeom);
	return lineGeom;
}


/*function interVector3(g,v1,v2){
	addMarker(g,v1,3,0xff0000)
	addMarker(g,v2,3,0x00ff00)
	console.log(v1.angleTo(v2));
	var m;
	var vv1 = new THREE.Vector3();
	var vv2 = new THREE.Vector3();

	vv1.copy(v1);
	vv2.copy(v2);

	if(vv1.angleTo(vv2)<Math.PI/2){
		m = vv1.add(vv2).length()/vv2.length()
		console.log("a")
	}else{
		m = vv2.length()/vv1.add(vv2).length()
		console.log("b")
	}
	var v = v1.add(v2).multiplyScalar(m)
	console.log(m);
	addMarker(g,v,3,0x0000ff)
}
*/
function interVector3(l){
	console.log(l);
	l.nums --;
	var newArr = [];
	var i = 0;
	while(i<l.vertices.length){
		let newV;
		let v_t1 = (new THREE.Vector3()).copy(l.vertices[i]);
		let v_t2 = (new THREE.Vector3()).copy(l.vertices[i+1]);
		let angle = v_t2.angleTo(v_t1);
		let m;
		if(angle>=2*Math.PI/3){
			m = v_t1.length()/v_t2.add(v_t1);
			newV = v_t1.add(l.vertices[i+1]).multiplyScalar(m);
		}else{
			m = v_t2.add(v_t1)/v_t1.length();
			newV = v_t2.add(l.vertices[i]).multiplyScalar(m);
		}
		console.log(v_t1);
		console.log(v_t2);
		newArr.push((new THREE.Vector3()).copy(l.vertices[i]));
		newArr.push((new THREE.Vector3()).copy(newV));
		if((i+2)==l.vertices.length){
			break;
		}else{
			i++;
		}
	}
	l.vertices = newArr;
	if(l.nums>0){
		interVector3(l)
	}else{
		return l;
	}
}



function addMarker(g,v,r,c){

	var geom = new THREE.SphereGeometry(r,40,40);
	var material = new THREE.MeshBasicMaterial({
		color:c
	});
	var mesh = new THREE.Mesh(geom,material);
	//var pos = getPos(v);
	mesh.position.set(v.x,v.y,v.z);
	g.add(mesh);
	console.log(mesh)
}


function getPosFromSpherical(r,phi,theta){
	return (new THREE.Vector3()).setFromSpherical(new THREE.Spherical(r,phi,theta));
}


