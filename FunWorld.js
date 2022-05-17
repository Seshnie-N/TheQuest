import * as THREE from 'three';
import { DoubleSide } from 'three';
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';
import { Reflector } from './examples/jsm/objects/Reflector.js';


//import './resources'; 

import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';

let camera, controls, scene, renderer;

var waterCamera, cubeMaterials, tree_loader;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
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
     /*   dracoloader.setDecoderPath('../examples/jsm/draco/');
        gltfloader.setDRACOLoader(dracoloader);
                
          
             gltfloader.load('./resources/img/avatar.glb',  function (gltf){
                gltf.scene.scale.set(10,10,10); 
                gltf.scene.position.set(59,1,0); 
                 
                 world.add(gltf.scene); 
                 loadingBar.visible = !loadingBar.domElement 
             }, xhr => {
                 loadingBar.update('map', xhr.loaded, xhr.total)
             },
             err =>{
                 console.error(err.message)
             })*/
           
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
                    [1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1],
                    [1,1,0,1,1,1,0,1,1,1,1,1,1,0,0,0,2,2,0,1],
                    [1,0,0,0,1,1,0,0,0,1,1,1,1,0,1,0,2,2,0,1],
                    [1,0,2,0,1,1,0,1,0,1,1,1,1,0,1,0,0,0,0,1],
                    [1,0,0,0,1,1,0,1,0,0,0,0,0,0,1,1,0,1,1,1],
                    [1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1],
                    [1,1,1,1,0,0,0,1,0,1,1,1,1,1,1,1,0,1,1,1],
                    [1,0,0,1,0,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1],
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
                var x = Math.floor((Math.random() * 5) + 1);
                if (x >= 5){
                    const tree = Tree(i*10,j*10);   
                    world.add( tree );
                }
                world.add( mesh );
            }
            if (filled[j][i] == 2){
                const water = Water(i*10,j*10);
                world.add(water);
            }
        }
    }


    return world;
}

function floorTile(x,z){
    // const geometry = new THREE.BoxGeometry(10, 2.5, 10);
    // const loader = new THREE.TextureLoader();
    // const cubeMaterials = [
    //     new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}), //right side
    //     new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}), //left side
    //     new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/grass.jpg')}), //top side
    //     new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}), //bottom side
    //     new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}), //front side
    //     new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}), //back side
    // ];
    // const tile = new THREE.Mesh(geometry, cubeMaterials);
    // tile.position.set(x,2.5/2,z);

    // return tile;

    // const tile = new THREE.Mesh(
    //     new THREE.BoxBufferGeometry(10,2.5,10),
    //     new THREE.MeshLambertMaterial({color: 'green', side: DoubleSide})
    // );
    // tile.position.set(x,2.5/2,z);
    // return tile;

    const tile = new THREE.Mesh(
        new THREE.BoxBufferGeometry(10,2.5,10),
        cubeMaterials
    );
    tile.position.set(x,2.5/2,z);
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
            new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}), //right side
            new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}), //left side
            new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/grass.jpg')}), //top side
            new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}), //bottom side
            new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}), //front side
            new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}), //back side
        ];
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
