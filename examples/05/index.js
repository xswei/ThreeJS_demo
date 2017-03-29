window.onload = ()=>{
	var mapDiv = document.querySelector("#map"),
		width = mapDiv.clientWidth,
		height = mapDiv.clientHeight;

	var earthRadius = 150;

	var stats = initStats();
	document.querySelector("#stats").appendChild(stats.domElement);

	
	scene = new THREE.Scene();

	var renderer = new THREE.WebGLRenderer();
	//renderer.setClearColor(0xffffff,0);
	renderer.setSize(width,height);

	var camera = new THREE.PerspectiveCamera(45,width/height,0.1,1000);
	camera.position.x = -earthRadius+300;
	camera.position.y = 300;
	camera.position.z = earthRadius+300;
	camera.lookAt(scene.position);
	
	var orbit = new THREE.OrbitControls(camera,renderer.domElement);
		
	earthGroup = new THREE.Object3D();

	scene.add(earthGroup);

	addEarth(earthGroup,earthRadius,"earth");
	

	document.querySelector("#map").appendChild(renderer.domElement)

	render();

	bindEvent(scene)
	function render(){
		stats.update();
		orbit.update();
		earthGroup.rotation.y +=0.003;
		if(scene.getObjectByName("lines")){
			updateLines(scene.getObjectByName("lines").children)
		}
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
		addPoints(g,r)
	})
	g.add(group);
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
function addPoints(g,r){
	d3.csv("../dataset/airport.csv",(err,csv)=>{
		console.log(csv);
		let pointGeom = new THREE.Geometry();
		csv.forEach((d)=>{
			let lng = parseFloat(d.Longtitude),
				lat = parseFloat(d.Latitude);
			pointGeom.vertices.push(getPos({
				lng:lng,
				lat:lat,
				r:r+5}));
		})
		let pointMaterial = new THREE.PointsMaterial({
			color:0x0ff0cc
		});
		let pointsSystem = new THREE.Points(pointGeom,pointMaterial);
		//g.add(pointsSystem);
		
		let linesGroup = new THREE.Object3D();
		linesGroup.name = "lines";

		for(var i=0;i<30;++i){
			addLines(linesGroup,csv);
		}
		console.log(linesGroup)
		g.add(linesGroup);
	})
}
function addLines(g,csv){
	var p1 = csv[Math.round(Math.random()*csv.length)-1],
		p2 = csv[Math.round(Math.random()*csv.length)-1];
	var l = {
		v1:getPos({
			lng:116,
			lat:41,
			r:150
		}),
		v2:getPos({
			lng:parseFloat(p2.Longtitude),
			lat:parseFloat(p2.Latitude),
			r:150
		}),
		nums:5
	}
	l.vertices = [l.v1,l.v2]
	console.log();
	curve = new THREE.CatmullRomCurve3(interVector3(l).vertices);
	var geometry = new THREE.Geometry();
	geometry.v = curve.getPoints( 200 );
	geometry.index = 0;
	for(let i=0,len=geometry.v.length;i<len;++i){
		geometry.vertices.push(geometry.v[geometry.index])
	}
	var material = new THREE.LineBasicMaterial({ 
		color : new THREE.Color(0xffffff*Math.random())
	});

	// Create the final object to add to the scene
	curveObject = new THREE.Line( geometry, material );
	g.add(curveObject);
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

function updateLines(lines){
	for(var i=0,len = lines.length;i<len;++i){
		var l = lines[i].geometry;
		l.index++;
		if(l.index>l.v.length){
			l.index=0;
			for(var k=0;k<l.v.length;++k){
				l.vertices[k] = l.v[0];
				l.verticesNeedUpdate = true;
			}
		}
		for(var j=0;j<l.index;++j){
			l.vertices[l.vertices.length-1-j] = l.v[j];
			l.verticesNeedUpdate = true;
		}
	}
}