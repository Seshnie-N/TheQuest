import * as THREE from 'three';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';
import {skybox} from "./skybox.js";
import {Avatar} from "./Avatar.js";
import {FBXLoader} from "./examples/jsm/loaders/FBXLoader.js";

class stage1{
    constructor(){
        this.init();
    }

    init(){
        //adding models to scene
        this._ConfigWorld();

        //add skybox
        const params = {
            scene : this.scene,
        }
        this.Skybox = new skybox(params);
        this.sb = this.Skybox.makeSkybox();

        this.addGround();

        this._mixers = [];

        //load in character here
        this._LoadAnimatedModel();

        this.previousRAF = null;
        this.animate();
    }

    _ConfigWorld() {
        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(25,10,25);

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

        light = new THREE.AmbientLight(0xFFFFFF, 5.0);
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({
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

        //initialise and config orbit controls
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.target.set(0,20,0);
        controls.update();

        controls.maxPolarAngle = Math.PI / 2;
    }

    // _ConfigPhysics() {
    //     this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    //     this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
    //     this.broadphase = new Ammo.btDbvtBroadphase();
    //     this.solver = new Ammo.btSequentialImpulseConstraintSolver();
    //     this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
    //         this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration);
    //     this.physicsWorld.setGravity(new Ammo.btVector3(0,-10,0));
    // }

    addGround() {
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0x202020,
            }));
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this.scene.add(plane);
    }



    OnWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame((t) => {
            if (this.previousRAF === null){
                this.previousRAF = t;
            }
            this.animate();

            this.renderer.render(this.scene, this.camera);
            this.step(t - this.previousRAF);
            this.previousRAF = t;
        });
    }

    step(timeElapsed){
        //update to enable animations
        const timeElapsedS = timeElapsed * 0.001;
        if (this._mixers) {
            this._mixers.map(m => m.update(timeElapsedS));
        }

        //update rotation of skybox for dynamic skybox
        this.sb.rotation.y += timeElapsedS*0.1;

        //update character movement
        if (this._controls) {
            this._controls.Update(timeElapsedS);
        }
    }

}

let APP_ = null;

window.addEventListener('DOMContentLoaded', async () => {
    APP_ = new stage1();
});