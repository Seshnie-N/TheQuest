import * as THREE from 'three';
import {OrbitControls} from "./examples/jsm/controls/OrbitControls.js";
import {player_entity} from "./player.js";
import {player_input} from "./player_input.js";
import {entity} from "./entity.js";
import {entity_manager} from "./entity_manager.js";
import {ThirdPersonCamera} from "./third_person_camera.js";

class World1 {
    constructor() {
    }

    init() {
        this.ConfigWorld();
        this.ConfigPhysics();
        this.AddGround();

        this.entity_man = new entity_manager.EntityManager();

        this.LoadPlayer();

        this.tmpTransform_ = new Ammo.btTransform();
        this.previousRAF_ = null;
        this.animate();
    }

    ConfigWorld() {
        //camera
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
        this.sun = light;
        this.scene.add(this.sun);

        light = new THREE.AmbientLight(0x101010);
        this.scene.add(light);

        //set up renderer
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

    ConfigPhysics() {
        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
            this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration);
        this.physicsWorld.setGravity(new Ammo.btVector3(0,-10,0));
    }

    AddGround() {
        //add ground to scene
        const ground = new THREE.Mesh(
            new THREE.BoxGeometry(100,1,100),
            new THREE.MeshStandardMaterial({color: 0x808080}));
        ground.position.set(-25,0,0)
        ground.castShadow = false;
        ground.receiveShadow = true;
        this.scene.add(ground);

        //add ground to physics world
        const rbGround = new RigidBody();
        rbGround.createBox(0,ground.position, ground.quaternion, new THREE.Vector3(100,1,100));
        rbGround.setRestitution(0.99);
        this.physicsWorld.addRigidBody(rbGround.body_);

        this.rigidBodies_ = [];
        //this.rigidBodies_.push();
    }

    LoadPlayer() {
        const params = {
            camera: this.camera,
            scene: this.scene,
        };

        const player = new entity.Entity();
        player.addComponent(new player_input.ControllerInput(params));
        player.addComponent(new player_entity.PlayerController(params));
        this.entity_man.add(player, 'player');

    }

    animate() {
        requestAnimationFrame((t) => {
            if (this.previousRAF_ === null){
                this.previousRAF_ = t;
            }

            this.step(t - this.previousRAF_);
            this.renderer.render(this.scene, this.camera);
            this.animate();
            this.previousRAF_ = t;
        });
    }

    step(timeElapsed){
        const timeElapsedS = timeElapsed * 0.01;
        this.physicsWorld.stepSimulation(timeElapsedS, 10);
        this.entity_man.update(timeElapsedS);

        for (let i = 0; i < this.rigidBodies_.length; i++){
            this.rigidBodies_[i].rigidBody.motionState_.getWorldTransform(this.tmpTransform_);
            const pos = this.tmpTransform_.getOrigin();
            const quat = this.tmpTransform_.getRotation();
            const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
            const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());

            this.rigidBodies_[i].mesh.position.copy(pos3);
            this.rigidBodies_[i].mesh.quaternion.copy(quat3);
        }
    }

    OnWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

}

//allows creation of rigid bodies to add to physics world
class RigidBody {
    constructor() {
    }

    setRestitution(val) {
        this.body_.setRestitution(val);
    }

    setFriction(val) {
        this.body_.setFriction(val);
    }

    setRollingFriction(val) {
        this.body_.setRollingFriction(val);
    }

    createBox(mass, pos, quat, size) {
        this.transform_ = new Ammo.btTransform();
        this.transform_.setIdentity();
        this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        this.transform_.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);

        const btSize = new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5);
        this.shape_ = new Ammo.btBoxShape(btSize);
        this.shape_.setMargin(0.05);

        this.inertia_ = new Ammo.btVector3(0, 0, 0);
        if (mass > 0) {
            this.shape_.calculateLocalInertia(mass, this.inertia_);
        }

        this.info_ = new Ammo.btRigidBodyConstructionInfo(
            mass, this.motionState_, this.shape_, this.inertia_);
        this.body_ = new Ammo.btRigidBody(this.info_);

        Ammo.destroy(btSize);
    }

}

let APP_ = null;

window.addEventListener('DOMContentLoaded', async () => {
    Ammo().then((lib) => {
        Ammo = lib;
        APP_ = new World1();
        APP_.init();
    });
});
