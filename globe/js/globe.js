var camera, scene, renderer, composer, cameraControl;

var w = window.innerWidth;
var h = window.innerHeight;

var stats,statsOn;

statsOn = true;

function init(){ 

    scene = new THREE.Scene();
    
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;

    camera = new THREE.PerspectiveCamera(45,w/h, 0.1, 1000);
    camera.position.z = 35;
    camera.position.x = 21;
    camera.position.y = 15;
    camera.lookAt(scene.position);

    //Create Earth
    var sphereGeometry = new THREE.SphereGeometry(15,30,30); //radius, width segments, height segments
    var earthMesh = new THREE.Mesh(sphereGeometry, createEarthMaterial());
    earthMesh.name = 'earth';
    scene.add(earthMesh);

    //create Clouds
    var cloudGeometry = new THREE.SphereGeometry(
       sphereGeometry.parameters.radius *1.01,
       sphereGeometry.parameters.widthSegments,
       sphereGeometry.parameters.heightSegments
   );
   var cloudMesh = new THREE.Mesh(cloudGeometry, createCloudMaterial() );
   cloudMesh.name = 'cloud';
   scene.add(cloudMesh);

    cameraControl = new THREE.OrbitControls( camera ,renderer.domElement );

    control = new function(){
        this.rotationSpeed = 0.001;
	this.cloudSpeed = -0.0002;
    };

    addLights()
    addControlGui(control);
    addStats();
    createBG(w,h);
    render();
}

function createBG(w,h){
    //Starry Background
    var cameraBG = new THREE.OrthographicCamera(-w,w,h,-h, -10000,10000);
    cameraBG.position.z = 50;

    var sceneBG = new THREE.Scene();
    var textureBG = new THREE.MeshBasicMaterial(
        {
            map: new THREE.TextureLoader().load("../assets/starry_background.jpg")
        , depthTest: false });
    var planeBG = new THREE.Mesh( new THREE.PlaneGeometry(1,1), textureBG);
    planeBG.position.z = -100;
    planeBG.scale.set(w*2,h*2,1);
    sceneBG.add(planeBG);

    //Combining Starry Background and actual scene
    var backgroundPass = new THREE.RenderPass(sceneBG, cameraBG);
    var renderPass = new THREE.RenderPass(scene,camera);
    renderPass.clear = false;
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(backgroundPass);
    composer.addPass(renderPass);
    composer.addPass(effectCopy);
    
    document.body.appendChild(renderer.domElement);
}


function createEarthMaterial(){
    var earthTexture = new THREE.TextureLoader().load("..ml/assets/earthmap10k.jpg");
    var earthMaterial = new THREE.MeshPhongMaterial();
    earthMaterial.map = earthTexture;

    //normal map
    var earthNormal = new THREE.TextureLoader().load("../assets/earth_normalmap_flat4k.jpg");
    earthMaterial.normalMap = earthNormal;
    earthMaterial.normalScale = new THREE.Vector2(0.5,0.7);

    //specular map
    earthMaterial.specularMap = new THREE.TextureLoader().load("../assets/earthspec4k.jpg");
    earthMaterial.specular = new THREE.Color(0x262626);
    return earthMaterial;
}

function createCloudMaterial(){
    var cloudMaterial = new THREE.MeshPhongMaterial();
    cloudMaterial.map = new THREE.TextureLoader().load("../assets/fair_clouds_4k.png");
    cloudMaterial.transparent = true;
    return cloudMaterial;
}

function addStats(){
    if(statsOn){
        stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = "absolute";
        stats.domElement.style.left = '0px';
        stats.domElement.style.right = '0px';
	stats.domElement.style.width = '160px';
        document.body.appendChild( stats.domElement);
    }
}

function addLights(){
    var directionalLight = new THREE.DirectionalLight( 0xffffff,1);
    directionalLight.position.set( 1, 0.8, -0.5).normalize();
    directionalLight.name = 'directional';
    directionalLight.target = scene.getObjectByName('earth');
    scene.add(directionalLight);
    scene.add( new THREE.AmbientLight(0x111111));
}

window.onload = init;

function addControlGui(controlObject){
    var gui = new dat.GUI();
    gui.add(controlObject, "rotationSpeed", -0.005, 0.01);
    gui.add(controlObject, "cloudSpeed", -0.001,0.001);
}


function render(){
    scene.getObjectByName("earth").rotation.y += control.rotationSpeed;  
    scene.getObjectByName("cloud").rotation.y += control.rotationSpeed + control.cloudSpeed; 
    if(statsOn)
         stats.update();
    cameraControl.update();
    
    //renderer.render(scene, camera);
    renderer.autoClear = false;
    composer.render();
    requestAnimationFrame(render);
}

function handleResize(){
    w = window.innerWidth;
    h = window.innerHeight;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w,h);
    console.log("window resized");
}

window.addEventListener('resize',handleResize,false);
