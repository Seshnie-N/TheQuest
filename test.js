import * as THREE from 'three';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from './examples/jsm/loaders/GLTFLoader.js';

class TestWorld{
    constructor(){
        this.init();
    }

    init(){
        this.canvas = document.querySelector('canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.OnWindowResize();
        }, false);

        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(75,20,0);

        //create scene
        this.scene = new THREE.Scene();

        //configure light source
        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(20, 100, 10);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 100;
        light.shadow.camera.right = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        this.scene.add(light);

        light = new THREE.AmbientLight(0x101010);
        this.scene.add(light);

        //initialise and config orbit controls
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.target.set(0,20,0);
        controls.update();

        controls.maxPolarAngle = Math.PI / 2;

        // const loader = new THREE.CubeTextureLoader();
        // const texture = loader.load([
        //     '.jpg',
        //     '.jpg',
        //     '.jpg',
        //     '.jpg',
        //     '.jpg',
        //     '.jpg',
        // ]);
        // this.scene.background = texture;

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(800, 800, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
            }));
        plane.position.set(0,-10,0)
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this.scene.add(plane);

        const box = new THREE.Mesh(
            new THREE.BoxGeometry(20, 20, 20),
            new THREE.MeshLambertMaterial({
                color: 0x808080,
            }));
        box.position.set(-20, 0, 0);
        box.castShadow = true;
        box.receiveShadow = true;
        this.scene.add(box);

        const box2 = new THREE.Mesh(
            new THREE.BoxGeometry(20, 20, 20),
            new THREE.MeshLambertMaterial({
                color: 0x95d917,
            }));
        box.position.set(20, 0, 0);
        box.castShadow = true;
        box.receiveShadow = true;
        this.scene.add(box2);

        //load stage model
        // const model_loader = new GLTFLoader();
        // model_loader.load('./resources/models/museum/scene.gltf',(gltf) => {
        //     this.scene.add(gltf.scene);
        // },
        //     function ( xhr ) {
        //         console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        //     },
        //     // called when loading has errors
        //     function ( error ) {
        //         console.log( 'An error happened' );
        //     }
        // );

        document.onkeydown = function (e) {
            if (e.code === "KeyW" || e.code === "ArrowUp") {
                box.position.z -= 20;
            }
            if (e.code === "KeyS" || e.code === "ArrowDown") {
                box.position.z += 20;
            }
            if (e.code === "KeyA" || e.code === "ArrowRight") {
                box.position.x -= 20;
            }
            if (e.code === "KeyD" || e.code === "ArrowLeft") {
                box.position.x += 20;
            }
            if (e.code === "Space") {
                box.position.y += 20;
            }
        }

        this.animate();
    }

    OnWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => {
            this.renderer.render(this.scene, this.camera);
            this.animate();
        });
    }

    initInput(){

    }

}

    let _APP = null;

    window.addEventListener('DOMContentLoaded', () => {
        _APP = new TestWorld();
    });
