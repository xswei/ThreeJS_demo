window.onload = ()=>{
	var w = document.querySelector("#map").clientWidth,
		h = document.querySelector("#map").clientHeight;

	var radius = 100;

	var scene = new THREE.Scene();
	
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(w,h);
	//renderer.setClearColor(0x111111);

	var camera = new THREE.PerspectiveCamera(45,w/h,1,1000);
	camera.position.x = -(radius+100);
	camera.position.y = (radius+100);
	camera.position.z = radius+100;
	camera.lookAt(scene.position);

	console.log(camera)

	var axes = new THREE.AxisHelper(radius)
	scene.add(axes);

	var earthG = new THREE.Object3D();
	var cloudG = new THREE.Object3D();

	scene.add(earthG);

	var ambientLight = new THREE.AmbientLight(0x333333);
	scene.add(ambientLight);

	var directLight = new THREE.DirectionalLight(0xffffff);
	directLight.position.x = -1000;
	directLight.position.z = 1000;
	directLight.position.z = 1000;
	directLight.intensity = 1;
	directLight.shadow.mapSize.width = 100;
	scene.add(directLight);


	addEarth(earthG,radius,"e3.png");


	var orbit = new THREE.OrbitControls(camera,renderer.domElement);
	var stats = function(){
		var s = new Stats();
		s.domElement.style.position = "absolute";
		s.domElement.style.left = "10px";
		s.domElement.style.top = "10px";
		return s;
	}();
	document.querySelector("#map").appendChild(renderer.domElement);
	document.querySelector("#stats").appendChild(stats.domElement);
	(function render(){
			stats.update();
			orbit.update();
			earthG.rotation.y +=0.001;
			cloudG.rotation.y +=0.003;
			requestAnimationFrame(render);
			renderer.render(scene,camera);
	})();
}
function addEarth(g,r,u,pos){
	var sphere = new THREE.SphereGeometry(r,40,40);
	var loader = new THREE.TextureLoader();
	loader.load("../images/"+u,(t)=>{
		var material = new THREE.MeshLambertMaterial({
			map:t
		});
		material.transparent = true;
		var mesh = new THREE.Mesh(sphere,material);
		mesh.castShadow = true;
		if(pos){
			mesh.position.copy(pos);
		}
		g.add(mesh);
	})
}
