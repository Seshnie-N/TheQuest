import * as THREE from 'three';
import { DoubleSide } from 'three';
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';
import { Reflector } from './examples/jsm/objects/Reflector.js';
import gsap from './node_modules/gsap/index.js';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';

let camera, controls, scene, renderer;

var waterCamera, cubeMaterials, tree_loader, shrub_loader, grass_loader;

init();

animate();

function init() {

    scene = new THREE.Scene();

    const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './resources/img/istockphoto-948602070-170667a.jpg',
            './resources/img/istockphoto-948602070-170667a.jpg',
            './resources/img/istockphoto-948602070-170667a.jpg',
            './resources/img/istockphoto-948602070-170667a.jpg',
            './resources/img/istockphoto-948602070-170667a.jpg',
            './resources/img/istockphoto-948602070-170667a.jpg',
        ]);
        scene.background = texture;

    //scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 400, 200, 0 );

    // controls

    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 100;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI / 2;

    // world

    InitaliseGrass();
    const world = World();
    scene.add( world );

    
    // lights
    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0x002288 );
    dirLight2.position.set( - 1, - 1, - 1 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0x222222 );
    scene.add( ambientLight );

    //

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();

}

function render() {
    
    renderer.render( scene, camera );

}

function World() {
    const world = new THREE.Group();

    const underFloor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2000,2000),
        new THREE.MeshBasicMaterial({color: '#42662e', side: DoubleSide})
    );
    //underFloor.position.set(100,1,210);
    underFloor.rotation.set(Math.PI/2,0,0);
    underFloor.position.set(100,0,210);
    world.add(underFloor);

    const floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(200,210),
        new THREE.MeshBasicMaterial({color: '#A5682A', side: DoubleSide})
    );
    floor.position.set(95,1,100);
    floor.rotation.set(Math.PI/2,0,0);
    world.add(floor);

    var filled = [
                    [1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
                    [1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
                    [1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,3,1],
                    [1,1,0,1,1,1,0,1,1,1,1,1,1,0,0,0,2,2,0,1],
                    [1,0,0,0,1,1,0,0,0,1,1,1,1,0,1,0,2,2,0,1],
                    [1,0,2,0,1,1,0,1,0,1,1,1,1,0,1,0,0,0,0,1],
                    [1,0,0,0,1,1,0,1,0,0,0,0,0,0,1,1,0,1,1,1],
                    [1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1],
                    [1,1,1,1,0,0,0,1,0,1,1,1,1,1,1,1,0,1,1,1],
                    [1,3,0,1,0,1,1,1,0,1,1,0,3,0,1,1,0,1,1,1],
                    [1,0,0,0,0,1,1,1,0,1,1,0,0,0,1,1,0,0,0,1],
                    [1,0,0,1,1,1,1,1,0,1,1,0,0,0,1,1,1,1,0,1],
                    [1,1,1,1,1,1,1,0,0,1,1,1,0,1,1,1,1,1,0,1],
                    [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1],
                    [1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1],
                    [1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
                    [1,1,1,1,0,1,1,0,0,1,1,1,1,1,0,1,1,1,1,1],
                    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,1],
                    [1,1,0,1,1,1,1,0,0,1,1,1,1,1,1,0,2,1,1,1],
                    [1,1,0,0,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1],
                    [1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],];

    for(let i=0;i<21;i++){
        for(let j=0;j<21;j++){
            if(filled[j][i] == 1){   
                const mesh = floorTile(i*10,j*10)
                world.add( mesh );
            }
            
            if (filled[j][i] == 2){
                const water = Water(i*10,j*10);
                world.add(water);
            }
            if (filled[j][i] == 3 ){
                const key = Key(i*10,j*10);
                world.add(key);
            }
            if (filled[j][i] == 3 ){
                const triangle = Triangle(i*10,j*10);
                world.add(triangle);
            }
        }
    }


    return world;
}

function floorTile(x,z){
  
    const tile = new THREE.Mesh(
        // new THREE.BoxBufferGeometry(10,2.5,10),
        new THREE.BoxBufferGeometry(10,4,10),
        cubeMaterials
    );
    tile.position.set(x,0.5,z);
    return tile;
}

function Tree(x,z){
    const tree = new THREE.Group;

    tree_loader = new GLTFLoader();
    tree_loader.load('./resources/models/tree_low_poly/scene.gltf',function (gltf) {
        gltf.scene.scale.set(5,5,5); 
        gltf.scene.position.set(x,0,z); 
        //gltf.scene.rotation.set(-Math.PI/2,0,0);
        tree.add(gltf.scene);  
    },(xhr) => xhr, ( err ) => console.error( err ));

    return tree;
}

function Key(x,z){
    const key = new THREE.Group;

    tree_loader = new GLTFLoader();
    tree_loader.load('./resources/models/oldKey/unlock.glb',function (gltf) {
        gltf.scene.scale.set(1,1,1); 
        gltf.scene.position.set(x,3,z); 

        gltf.scene.rotation.set(-Math.PI/2,Math.PI/6,0, 'YXZ' );
        gsap.to(gltf.scene.position, {y:'+=3', duration:1, delay: 0, ease:'none', repeat:-1, yoyo:true
          })
        key.add(gltf.scene);  
    },(xhr) => xhr, ( err ) => console.error( err ));

    
    return key;
}
function Triangle(x,z){
    const triangle = new THREE.Group;
    tree_loader = new GLTFLoader();
    tree_loader.load('./resources/models/triangle/scene.gltf',function (gltf) {
        gltf.scene.scale.set(5,10,5); 
        gltf.scene.position.set(x,15,z); 

        gltf.scene.rotation.x = (Math.PI );
        gsap.to(gltf.scene.position, {y:'+=3', duration:1, delay: 0, ease:'none', repeat:-1, yoyo:true
          })
        triangle.add(gltf.scene);  
    },(xhr) => xhr, ( err ) => console.error( err ));

    
    return triangle;
}

function Water(x,z) {
    let water = new THREE.Group

    let geometry;

    geometry = new THREE.PlaneGeometry(10,10);
    waterCamera = new Reflector( geometry, {
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: 0x777777
    });

    waterCamera.position.set(x,2,z);
    waterCamera.rotateX( -Math.PI / 2 );
    water.add( waterCamera );

    return water;
}

function InitaliseGrass() {
    const loader = new THREE.TextureLoader();
    cubeMaterials = [
            new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/grass.jpg')}), //right side
            new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/grass.jpg')}), //left side
            new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/grass.jpg')}), //top side
            new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}), //bottom side
            new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/grass.jpg')}), //front side
            new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/grass.jpg')}), //back side
        ];
}

function Shrub(x,z){
    const shrub = new THREE.Group;

    shrub_loader = new GLTFLoader();
    shrub_loader.load('./resources/models/low_poly_shrub/scene.gltf',function (gltf) {
        gltf.scene.scale.set(10,10,10); 
        gltf.scene.position.set(x,2,z); 
        //gltf.scene.rotation.set(-Math.PI/2,0,0);
        shrub.add(gltf.scene);  
    },(xhr) => xhr, ( err ) => console.error( err ));

    return shrub;
}

function SpineGrass(x,z){
    const grass = new THREE.Group;

    grass_loader = new GLTFLoader();
    grass_loader.load('./resources/models/spine_grass/scene.gltf',function (gltf) {
        gltf.scene.scale.set(2,2,2); 
        gltf.scene.position.set(x,2,z); 
        //gltf.scene.rotation.set(-Math.PI/2,0,0);
        grass.add(gltf.scene);  
    },(xhr) => xhr, ( err ) => console.error( err ));

    return grass;
}

// function InitaliseTree() {
//     tree_loader = new GLTFLoader();
//         tree_loader.load('./resources/models/tree_low_poly/scene.gltf',function (gltf) {
//             gltf.scene.scale.set(5,5,5); 
//             gltf.scene.position.set(x,0,z); 
//             //gltf.scene.rotation.set(-Math.PI/2,0,0);
//             tree.add(gltf.scene);  
//         },(xhr) => xhr, ( err ) => console.error( err ));
// }
