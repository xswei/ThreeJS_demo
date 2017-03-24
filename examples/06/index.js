window.onload = ()=>{
	
	log = console.log.bind(console)

	var mapDiv = document.querySelector("#main"),
		width = mapDiv.clientWidth-500,
		height = mapDiv.clientHeight;

	infoCanvas = document.querySelector("#infoC");
	infoCanvas.width = 500;
	infoCanvas.height = height;

	window.infoCtx = infoCanvas.getContext("2d");

	window.infoList = [];

	earthRadius = 150;

	var stats = initStats();
	document.querySelector("#stats").appendChild(stats.domElement);

	window.lines = [];

	window.points = [];
	
	//var pointsGeo = new THREE.Geometry();


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
	

	document.querySelector("#map").append(renderer.domElement)

	render();

	bindEvent(scene)
	function render(){
		stats.update();
		orbit.update();
		updatePoints();
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
		let pointGeom = new THREE.Geometry();
		window.csv = csv;
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

		

		for(let m =0;m<10;++m){
			let p1 = csv[Math.floor(Math.random()*csv.length)-1],
				p2 = csv[Math.floor(Math.random()*csv.length)-1];
			let v1 = {
				lng:parseFloat(p1.Longtitude),
				lat:parseFloat(p1.Latitude),
				r:r
			},v2 = {
				lng:parseFloat(p2.Longtitude),
				lat:parseFloat(p2.Latitude),
				r:r
			};
			createLines(v1,v2,r,p1.Name,p2.Name);
			displayInfo(p1.Name,p2.Name,1);
		}
		
	})
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


function createLines(v1,v2,r,s,t){

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
	var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
			map:getTexture()
	}))
	sprite.position.copy(curve.getPointAt(0));
	earthGroup.add(sprite)
	/*var geometry = new THREE.Geometry();
	geometry.vertices = curve.getPoints( 50 );

	var material = new THREE.LineBasicMaterial({ 
		color : 0xff0000 
	} );*/

	// Create the final object to add to the scene
	/*var curveObject = new THREE.Line( geometry, material );
	earthGroup.add(curveObject)*/
	points.push({
		path:curve,
		step:0.005*Math.random(),
		delta:0,
		points:sprite,
		source:s,
		target:t
	})
}
function getTexture(){
	var canvas = document.createElement("canvas");
	canvas.width = 32;
	canvas.height = 32;

	var ctx = canvas.getContext("2d");
 	var gr = ctx.createRadialGradient(16,16,0,16,16,16);
 	var color = (new THREE.Color(0xffffff*Math.random())).getStyle()
    gr.addColorStop(0,color);
    gr.addColorStop(1,color);
   // gr.addColorStop(1,'rgba(0,0,0,0)');      
    ctx.fillStyle = gr;
    ctx.fillRect(0,0,32,32);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}
function updatePoints(){
	var newArr = [];
	for(let i=0;i<points.length;++i){
		points[i].delta += points[i].step;
		points[i].points.position.copy(points[i].path.getPointAt(points[i].delta))
		if(points[i].delta<1){
			newArr.push(points[i]);
		}else{
			displayInfo(points[i].source,points[i].target,false)
		}
	}
	
	points = newArr;
	if(points.length<100){
		let n = Math.random()*10
		console.log(typeof csv)
		if(typeof csv != "undefined"){
			for(let j=0;j<n;++j){
			let p1 = csv[Math.floor(Math.random()*csv.length)-2],
				p2 = csv[Math.floor(Math.random()*csv.length)-2];
			let v1 = {
				lng:parseFloat(p1.Longtitude),
				lat:parseFloat(p1.Latitude),
				r:earthRadius
			},v2 = {
				lng:parseFloat(p2.Longtitude),
				lat:parseFloat(p2.Latitude),
				r:earthRadius
			};
			createLines(v1,v2,earthRadius,p1.Name,p2.Name);
			displayInfo(p1.Name,p2.Name,1);
			}
		}
	}
}


function displayInfo(s,t,f){
	var str;
	if(f){
		str={
			str:s+" --> "+t+" TAKE OFF",
			c:"#631dc6"
		}
	}else{
		str={
			str:s+" --> "+t+" LANDED",
			c:"#b1ca17"
		}
	}
	if(infoList.length>20){
		infoList.shift();
		infoList.push(str)
	}else{
		infoList.push(str)
	}
	infoCtx.clearRect(0,0,infoCanvas.width,infoCanvas.height);
	infoList.forEach((d,i)=>{
		infoCtx.fillStyle=d.c
		infoCtx.fillText(d.str,10,(i+5)*20)
	})
}