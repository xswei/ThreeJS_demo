window.onload = ()=>{
	var color = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]


	var mapDiv = document.querySelector("#main"),
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
		
	var earthGroup = new THREE.Object3D();
	var lineGroup = new THREE.Object3D();
	scene.add(earthGroup);
	scene.add(lineGroup);

	addEarth(earthGroup,earthRadius,"earth");
	
	

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && xhr.status == 200){
			addAirLine(lineGroup,earthRadius,JSON.parse(xhr.responseText),color)
		}
	}
	xhr.open("GET","../dataset/flights.json",true);
	xhr.send();


	document.querySelector("#map").appendChild(renderer.domElement)
	render();
	bindEvent(scene)
	function render(){
		stats.update();
		orbit.update();

		renderer.render(scene,camera);
		requestAnimationFrame(render);
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
	//s.add(new THREE.AxisHelper(l));
}
function addEarth(g,r,str){
	var group = new THREE.Object3D();
	var sphereGeom = new THREE.SphereGeometry(r,40,40,Math.PI/2);
	var loader = new THREE.TextureLoader();
	loader.load("../images/e4.jpg",(t)=>{
		let material = new THREE.MeshBasicMaterial({
			map:t
		});
		let earth = new THREE.Mesh(sphereGeom,material)
		earth.name = str;
		earth.textureName = 4;
		group.add(earth);
	})
	g.add(group);
}
function addAirLine(g,radius,json,c){
	console.log(json);
	for(let i=0,len = json.routes.length;i<len;++i){
		let r = json.routes[i];
		let l = {
			p1:{
				lng:json.airports[r[1]][3],
				lat:json.airports[r[1]][4],
				r:radius
			},
			p2:{
				lng:json.airports[r[2]][3],
				lat:json.airports[r[2]][4],
				r:radius
			}
		}
		let curve = createLines(l.p1,l.p2);
		let geom = new THREE.Geometry();
		geom.vertices = curve.getPoints(10);
		var material = new THREE.LineBasicMaterial({
			color:new THREE.Color(c[r[0]>=9?9:r[0]])
		})
		g.add(new THREE.Line(geom,material))
		if(i>100){
			//break;
		}
	}
}


function getPos(v){
	var theta = (v.lng+180)*(Math.PI/180),
		phi = (90-v.lat)*(Math.PI/180),
		radius = v.r;
	return (new THREE.Vector3()).setFromSpherical(new THREE.Spherical(radius,phi,theta));
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
}




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


function createLines(v1,v2){

	var delta = getPos(v1).angleTo(getPos(v2)),
		source = v1.name,
		target = v2.name,
		r = v1.r,
		dr = (v1.r*delta*delta*0.6)/Math.PI,
		p1 = getPos({
			lng:v1.lng,
			lat:v1.lat,
			r:v1.r+dr
		}),p2 = getPos({
			lng:v2.lng,
			lat:v2.lat,
			r:v2.r+dr
		}),
		v1 = getPos(v1),
		v2 = getPos(v2);
	var intetPoints = interVector3({
		v1:p1,
		v2:p2,
		nums:2,
		vertices:[p1,p2]
	})

	var curve = new THREE.CubicBezierCurve3(
		v1,
		intetPoints.vertices[1],
		intetPoints.vertices[3],
		v2
	);
	return curve;


}


function bindEvent(s){
	var button = document.querySelectorAll("#button button");
	button.forEach((d)=>{
		d.addEventListener("click",(e)=>{
			let id = e.target.id;
			let earth = s.getObjectByName("earth");
			if(earth.textureName==id){
				return;
			}else{
				let loader = new THREE.TextureLoader();
				let url = "../images/e"+id+"."+(id==4?"jpg":"png")
				loader.load(url,(t)=>{
					let material = new THREE.MeshBasicMaterial({
						map:t
					});
					earth.material = material;
					earth.textureName = id;
					earth.material.needsUpdate = true;
				})
			}
		})
	})
}
