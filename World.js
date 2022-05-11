import * as THREE from 'three';
import { DoubleSide } from 'three';

import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';

let camera, controls, scene, renderer;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xcccccc );
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

    const floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1200,1200),
        new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide})
    );
    floor.rotation.set(Math.PI/2,0,0);
    scene.add(floor)

    const mesh = World();
    scene.add( mesh );

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

function World(){
    const room = new THREE.Group();

    var h = 75/2;

    //Centeral floor
    const floor = Floor(600,400,1);
    floor.position.set(0,1,0);
    room.add(floor);

    //small square room floor
    const floor2 = Floor(200,200,1);
    floor2.position.set(200,1,300);
    room.add(floor2);

    //smallquareroom to certerroom wall
    const wall = Door(600,75,500);
    wall.position.set(0,h,400/2);
    room.add(wall);

    //large square room to certer room wall
    const wall2 = Door(600,75,100);
    wall2.position.set(0,h,-400/2);
    room.add(wall2);

    //South most wall
    const wall3 = Wall(600,75);
    wall3.rotation.y = Math.PI/2;
    wall3.position.set(300,h,100);
    room.add(wall3);

    //North most wall
    const wall4 = Wall(800,75);
    wall4.rotation.y = Math.PI/2;
    wall4.position.set(-300,h,-200);
    room.add(wall4);

    //small quare room closeing walls
    const wall5 = Wall(200,75);
    wall5.position.set(200,h,400);
    room.add(wall5);
    const wall6 = Wall(200,75);
    wall6.rotation.y = Math.PI/2;
    wall6.position.set(100,h,300);
    room.add(wall6);

    //large square room floor
    const floor3 = Floor(400,400,1);
    floor3.position.set(-100,1,-400);
    room.add(floor3);

    //large square closeing walls
    const wall7 = Wall(400,75);
    wall7.position.set(-100,h,-600);
    room.add(wall7);
    const wall8 = Wall(400,75);
    wall8.rotation.y = Math.PI/2;
    wall8.position.set(100,h,-400);
    room.add(wall8);
    
    //small room roof
    const roof = new THREE.Mesh(
        new THREE.BoxBufferGeometry(200,200,5),
        new THREE.MeshBasicMaterial({color: '#A5682A', side: DoubleSide})
    );
    roof.rotation.set(Math.PI/3,Math.PI/2,0, 'YXZ');
    roof.position.set(130,90,300);
    room.add(roof);
    const roof2 = new THREE.Mesh(
        new THREE.BoxBufferGeometry(200,200,5),
        new THREE.MeshBasicMaterial({color: '#A5682A', side: DoubleSide})
    );
    roof2.rotation.set(Math.PI/3,-Math.PI/2,0, 'YXZ');
    roof2.position.set(280,90,300);
    room.add(roof2);

    return room;
}

//Makes the floor of a room
function Floor(x,y,z){
    const floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(x,y,1),
        new THREE.MeshBasicMaterial({color: '#4C4C4C', side: DoubleSide})
    );
    floor.rotation.set(Math.PI/2,0,0);

    return floor;
}

function Wall(x,y){
    const wall = new THREE.Mesh(
        new THREE.BoxBufferGeometry(x,y,5),
        new THREE.MeshLambertMaterial({color: '#A5682A', side: DoubleSide})
    );
    return wall
}

function Door(x,y,p){
    const door = new THREE.Group();

    var w = 20;
    var h = 50;

    const wall1 = new THREE.Mesh(
        new THREE.BoxBufferGeometry(p-w,y,5),
        new THREE.MeshLambertMaterial({color: '#A5682A', side: DoubleSide})
    );
    const wall2 = new THREE.Mesh(
        new THREE.BoxBufferGeometry(x-(p+w),y,5),
        new THREE.MeshLambertMaterial({color: '#A5682A', side: DoubleSide})
    );
    const wall3 = new THREE.Mesh(
        new THREE.BoxBufferGeometry(2*w,(y-h),5),
        new THREE.MeshLambertMaterial({color: '#A5682A', side: DoubleSide})
    );

    wall1.position.set(((p-w)/2)-(x/2),0,0);
    wall2.position.set((p+w+(x-(p+w))/2)-(x/2),0,0);
    wall3.position.set(p-(x/2),h/2,0);

    door.add(wall1,wall2,wall3);

    return door;
}