import * as THREE from 'three';
import { DoubleSide } from 'three';
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';
import { Reflector } from './examples/jsm/objects/Reflector.js';
import { DRACOLoader} from './examples/jsm/loaders/DRACOLoader.js';

import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';

let camera, controls, scene, renderer;

var waterCamera, cubeMaterials, ground, tree_loader, shrub_loader, grass_loader;

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

    InitaliseTexture();
    const world = World();
    scene.add( world );

    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 20, 10, 20 );
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
        new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}),
    );

    underFloor.rotation.set(Math.PI/2,0,0);
    underFloor.position.set(100,0,210);
    world.add(underFloor);

    // const loader = new THREE.TextureLoader();
    // const floor = new THREE.Mesh(
    //     new THREE.PlaneBufferGeometry(200,210),
    //     new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/ulrick-wery-tileableset2-soil.jpg'), side: DoubleSide})
    // );
    // floor.position.set(95,1,100);
    // floor.rotation.set(Math.PI/2,0,0);
    // world.add(floor);

    var filled = [
                    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
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

    for(let i=0;i<20;i++){
        for(let j=0;j<21;j++){
            if(filled[j][i] != 1){
                const mesh = floorTile(i*10,j*10);
                world.add( mesh );
            }
            if(filled[j][i] == 1){   
                const mesh = hedgeWall(i*10,j*10);
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
            if (filled[j][i] == 4){
                const spineGrass = SpineGrass(i*10,j*10);   
                world.add( spineGrass );
            }
        }
    }

    return world;
}

function floorTile(x,z){
    const floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(10,10),
        ground
    );
    floor.rotation.set(Math.PI/2,0,0);
    floor.position.set(x,1,z);
    return floor;
}

function hedgeWall(x,z){
    const wall = new THREE.Mesh(
        new THREE.BoxBufferGeometry(10,10,10),
        cubeMaterials
    );
    wall.castShadow = true;
    wall.position.set(x,5,z);
    return wall;
}

function Tree(x,z){
    const tree = new THREE.Group;

    tree_loader = new GLTFLoader();
    tree_loader.load('./resources/models/tree_low_poly/scene.gltf',function (gltf) {
        gltf.scene.scale.set(5,5,5); 
        gltf.scene.position.set(x,0,z); 
        tree.add(gltf.scene);  
    },(xhr) => xhr, ( err ) => console.error( err ));

    return tree;
}

function Key(x,z){
    const key = new THREE.Group;

    tree_loader = new GLTFLoader();
    tree_loader.load('./resources/models/oldKey/scene.gltf',function (gltf) {
        gltf.scene.scale.set(0.01,0.01,0.01); 
        gltf.scene.position.set(x,5,z); 
        gltf.scene.rotation.set(-Math.PI/2,Math.PI/6,0, 'YXZ' );
        key.add(gltf.scene);  
    },(xhr) => xhr, ( err ) => console.error( err ));

    return key;

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

function InitaliseTexture() {
    const loader = new THREE.TextureLoader();
    cubeMaterials = [
            new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/Hedge_full_perms_texture_seamless.jpg')}), //right side
            new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/Hedge_full_perms_texture_seamless.jpg')}), //left side
            new THREE.MeshBasicMaterial({ map: loader.load('./resources/img//Hedge_full_perms_texture_seamless.jpg')}), //top side
            new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide}), //bottom side
            new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/Hedge_full_perms_texture_seamless.jpg')}), //front side
            new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/Hedge_full_perms_texture_seamless.jpg')}), //back side
        ];
    const loaderGround = new THREE.TextureLoader();
    ground = new THREE.MeshBasicMaterial({ map: loaderGround.load('./resources/img/ulrick-wery-tileableset2-soil.jpg'), side: DoubleSide});
}

function Shrub(x,z){
    const shrub = new THREE.Group;

    shrub_loader = new GLTFLoader();
    shrub_loader.load('./resources/models/low_poly_shrub/scene.gltf',function (gltf) {
        gltf.scene.scale.set(10,10,10); 
        gltf.scene.position.set(x,2,z); 
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
        grass.add(gltf.scene);  
    },(xhr) => xhr, ( err ) => console.error( err ));

    return grass;
}
