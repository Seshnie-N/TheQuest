import * as THREE from 'three';
import {skybox} from "../skybox.js";
import * as CANNON from 'cannon-es'
import * as CHARACTER from "../Character.js";
import  * as CAMERA from "../ThirdPersonCamera.js";
import {GLTFLoader} from '../../resources/loaders/GLTFLoader.js';
import  {Reflector}  from '../../resources/objects/Reflector.js';
import CannonDebugger from 'cannon-es-debugger';
import gsap from "gsap";


let mirrorCamera, cubeMaterials, ground, tree_loader,key_loader,triangle_loader, grass_loader,shrub_loader, cannonDebugger, key,triangle, door, collectedKeys, door_loader, doormixer, opendoor, Pause,hiddenTexture;

class level_one {
    constructor() {
        //initialise all components of the game/scene
        this.init();
    }

    //create level
    init(){
        //declare variables
        collectedKeys = 0;
        
        opendoor = false;
        Pause = false;
        //Mouse event listeners.
        document.addEventListener("click", (e)=> this._onClick(e), false);
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.addTimer();
        this.configThree();
        this.configPhysics();
        this.addMapCamera();
        this.generateWorld();        
        this.addSkybox();
        this._LoadAnimatedModels();
        this.addKeyCount();
        this.addPauseButton();
        //this.music();
        this.addSound();

        cannonDebugger = new CannonDebugger(this.scene, this.world);

        this.previousRAF = null;

        this.animate();

    }

    configThree() {

        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1500.0;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(25,7,25);

        //create scene
        this.scene = new THREE.Scene();

        //first directional light
        let light = new THREE.DirectionalLight(0xffdb6a, 1.0);
        light.position.set(450,350,500);
        light.target.position.set(200,20,0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 700.0;
        light.shadow.camera.left =350;
        light.shadow.camera.right = -350;
        light.shadow.camera.top = 350;
        light.shadow.camera.bottom = -350;
        this.scene.add(light);
        this.scene.add(light.target);

        // const helper1 = new THREE.DirectionalLightHelper(light, 10);
        // this.scene.add(helper1);

         //second directional light
         const light2 = new THREE.DirectionalLight(0xffdb6a, 0.8);
         light2.position.set(450,350,500);
         light2.target.position.set(200,20,0);
         light2.castShadow = true;
         light2.shadow.bias = -0.001;
         light2.shadow.mapSize.width = 2048;
         light2.shadow.mapSize.height = 2048;
         light2.shadow.camera.near = 0.5;
         light2.shadow.camera.far = 700.0;
         light2.shadow.camera.left =350;
         light2.shadow.camera.right = -350;
         light2.shadow.camera.top = 350;
         light2.shadow.camera.bottom = -350;
         this.scene.add( light2 );
         this.scene.add(light2.target);

        // const helper = new THREE.DirectionalLightHelper(light2, 10);
        // this.scene.add(helper);

        //add hemisphere light to scene.
        const hemi_light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 0.8);
        this.scene.add(hemi_light);

        //add ambient light
        const ambi_light = new THREE.AmbientLight(0xFFFFFF, 1.0);
        this.scene.add(ambi_light);
        this.canvas = document.querySelector('#c');
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);


        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.OnWindowResize();
        }, false);
    }

    configPhysics() {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -200, 0)
        })
        this.timeStep = 1/60;
    }

    addMapCamera(){
        
        this.mapWidth =300;
        this.mapHeight = 300;
        this.mapCamera = new THREE.OrthographicCamera(
            this.mapHeight,		// Left
            -this.mapHeight,		// Right
            -this.mapHeight,		// Top
            this.mapHeight,	// Bottom
            1,         // Near
            1000);
        this.mapCamera.position.set(285,300,285);
        this.mapCamera.lookAt(new THREE.Vector3(285, 1, 285));

    }


    generateWorld() {

        //plane in physics world
        this.planeBody = new CANNON.Body({
            shape: new CANNON.Plane(),
            type: CANNON.Body.STATIC
        })
        this.world.addBody(this.planeBody);
        this.planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

        //world builder code
        const Level = new THREE.Group();

        this.InitaliseTexture();

        //stage 20x20 keys 5
        
        var filled = [
            [1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ],
            [1 ,0 ,4 ,0 ,1 ,1 ,5 ,1 ,1 ,1 ,3 ,0 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ],
            [1 ,1 ,1 ,5 ,5 ,4 ,0 ,1 ,0 ,0 ,0 ,0 ,1 ,1 ,1 ,0 ,0 ,0 ,3 ,1 ],
            [1 ,1 ,1 ,0 ,1 ,1 ,4 ,1 ,0 ,1 ,0 ,9 ,1 ,0 ,0 ,0 ,0 ,8 ,0 ,1 ],
            [1 ,0 ,0 ,5 ,0 ,1 ,0 ,0 ,0 ,1 ,4 ,0 ,1 ,0 ,1 ,0 ,4 ,0 ,0 ,1 ],
            [1 ,5 ,9 ,4 ,4 ,1 ,4 ,1 ,0 ,1 ,1 ,1 ,1 ,4 ,1 ,5 ,4 ,0 ,5 ,1 ],
            [1 ,0 ,4 ,0 ,0 ,1 ,0 ,0 ,0 ,0 ,0 ,5 ,4 ,4 ,1 ,1 ,0 ,1 ,1 ,1 ],
            [1 ,1 ,1 ,1 ,1 ,1 ,4 ,1 ,0 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,5 ,1 ,1 ,1 ],
            [1 ,1 ,1 ,1 ,0 ,4 ,5 ,1 ,4 ,1 ,11,10,10,10,10,1 ,0 ,1 ,1 ,1 ],
            [1 ,3 ,4 ,1 ,5 ,1 ,1 ,1 ,0 ,1 ,1 ,1 ,10,1 ,1 ,1 ,5 ,1 ,1 ,1 ],
            [1 ,0 ,0 ,0 ,0 ,1 ,1 ,1 ,5 ,1 ,1 ,0 ,0 ,9 ,1 ,1 ,4 ,5 ,0 ,1 ],
            [1 ,0 ,5 ,1 ,1 ,1 ,1 ,1 ,0 ,1 ,1 ,0 ,5 ,4 ,1 ,1 ,1 ,1 ,4 ,1 ],
            [1 ,10,1 ,1 ,1 ,1 ,1 ,4 ,0 ,1 ,1 ,1 ,4 ,1 ,1 ,1 ,1 ,1 ,0 ,1 ],
            [1 ,10,1 ,1 ,0 ,5 ,0 ,0 ,4 ,5 ,0 ,4 ,4 ,5 ,4 ,1 ,1 ,1 ,4 ,1 ],
            [1 ,10,1 ,1 ,4 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,4 ,0 ,5 ,0 ,4 ,1 ],
            [1 ,10,10,10,0 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,0 ,1 ,1 ,1 ,1 ,1 ],
            [1 ,1 ,1 ,1 ,0 ,1 ,1 ,0 ,9 ,1 ,1 ,1 ,1 ,1 ,5 ,1 ,1 ,1 ,1 ,1 ],
            [1 ,1 ,4 ,0 ,5 ,0 ,5 ,4 ,4 ,0 ,5 ,0 ,5 ,0 ,0 ,4 ,0 ,1 ,1 ,1 ],
            [1 ,1 ,7 ,1 ,1 ,1 ,1 ,5 ,0 ,1 ,1 ,1 ,1 ,1 ,1 ,0 ,3 ,1 ,1 ,1 ],
            [1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ]];

            for(let i=0;i<20;i++){
                for(let j=0;j<20;j++){
                    if(filled[j][i] !== 1){
                        const mesh = this.floorTile(i*30,j*30);
                        Level.add( mesh );
                    }
                    if(filled[j][i] === 1){
                        const mesh = this.hedgeWall(i*30,j*30);
                        Level.add( mesh );
                    }
                    if (filled[j][i] === 2){
                        const mirror = this.Mirror(i*30,j*30,-Math.PI/2);
                        Level.add(mirror);
                    }
                    if (filled[j][i] === 3 ){
                        const key = this.UnHiddenKey(i*30,j*30);
                        Level.add(key);
                        const triangle = this.Triangle(i*30,j*30);
                        Level.add(triangle);
                    }
                    if (filled[j][i] === 4){
                        const r = Math.floor(Math.random() * 30)+1
                        const s = Math.floor(Math.random() * 30)+1
                        const spineGrass = this.SpineGrass(i*30+r-15,j*30+s-15);   
                        Level.add( spineGrass );
                    }
                    if (filled[j][i] === 5){
                        const r = Math.floor(Math.random() * 20)+1
                        const s = Math.floor(Math.random() * 20)+1
                        const shrub = this.Shrub(i*30+r-15,j*30+s-15);   
                        Level.add( shrub );
                    }
                   
                    if (filled[j][i] === 7){
                        const door = this.door(i*30,j*30);
                        Level.add( door );
                    }
                    if (filled[j][i] === 8){
                        const pond = this.Pond(i*30,j*30);   
                        Level.add( pond );
                    }
                    if (filled[j][i] === 9){
                        const rock = this.Rock(i*30,j*30);   
                        Level.add( rock );
                    }
                    if(filled[j][i] === 10){
                        const mesh = this.HiddenTile(i*30,j*30);
                        Level.add( mesh );
                    }
                    if(filled[j][i] === 11){
                        const key = this.HiddenKey(i*30,j*30);
                        Level.add(key);
                        const triangle = this.Triangle(i*30,j*30);
                        Level.add(triangle);
                    }
                }
            }
            this.scene.add( Level )
    }

    addSkybox() {
        const params = {
            scene : this.scene,
            type: 'dusk',
            dim: new THREE.Vector3(900,900,900),
            pos: new THREE.Vector3(300,0,300)
        }
        this.Skybox = new skybox(params);
    }

    _LoadAnimatedModels(){

        //set character location in scene
        this.startPos = new CANNON.Vec3(40,0,30);

        //Params to be passed to the character class.
        const CharParams = {
            renderer: this.renderer,
            camera: this.camera,
            scene: this.scene,
            world: this.world,
            startPos : this.startPos,
        }
        this.Character = new CHARACTER.Character(CharParams)

        //Setup third person camera class.
        if (this.Character) {
            const CamParams = {
                camera: this.camera,
                target: this.Character
            }
            this.CAM = new CAMERA.ThirdPersonCamera(CamParams);
        }
    }

    //Use Raycasting to see if mouse is in contact with a key. If so, collect key, updated number of collected keys and update game UI.
    _onClick(event){
        this.mouse = {
            x: (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1,
            y: -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1
        }
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects_key = this.raycaster.intersectObjects(key.children, true);

        if (intersects_key.length > 0){
            let target = intersects_key[0];
            //target.object.visible = false;
            target.object.position.y -= 50;
            collectedKeys += 1;
            this.updateKeyText();
            console.log( collectedKeys);
        }

        let intersects_door = this.raycaster.intersectObjects(door.children, true);

        if (intersects_door.length > 0){
            //check if all keys collected
            if (collectedKeys >= key.children.length){
                opendoor = true;
                setTimeout(function(){ Pause=true;
                    let WinOverlay = document.getElementById("Win");
                    WinOverlay.style.width = "100%";},1600)
                // let WinOverlay = document.getElementById("Win");
                //     WinOverlay.style.width = "100%";
            }else{
                let width =70;
                this.ObjtextSpan = document.createElement("span")
                this.ObjtextSpan.id = "objText"
                this.ObjtextSpan.style.padding = "20px"
                this.ObjtextSpan.style.fontFamily = "sans-serif"
                this.ObjtextSpan.style.color = '#ffffff'
                this.ObjtextSpan.style.fontSize = 45 + 'px'
                this.ObjtextSpan.textContent = "Find the Keys"
        
                this.objText = document.createElement('div')
                this.objText.id = "objDiv"
                this.objText.style.position = 'absolute';
                this.objText.style.display = "flex";
                this.objText.style.alignItems = "center";
                this.objText.style.backgroundColor="#000000"
                this.objText.style.borderRadius="25px";
                this.objText.append(this.ObjtextSpan)
                this.objText.style.top = "15%";
                this.objText.style.left= "50%";
                this.objText.style.marginLeft= "-"+width+"px"
                this.objText.unselectable = "on"
                this.objText.style.transform="scale(0.5)";
                document.body.appendChild(this.objText);
                setTimeout(() => {
                    const elem = document.getElementById("objDiv");
                    if(elem != null){
                        elem.parentNode.removeChild(elem);
                    }
                }, 5000);
            }
        }

    }

    //continuous rendering to create animation
    animate() {
         //if game is pause break loop.
         if (Pause === true) {
            return
        }
        requestAnimationFrame((t) => {
            if (this.previousRAF === null){
                this.previousRAF = t;
            }
            //move forward physics world
            this.world.step(this.timeStep);

            this.animate();

            let w = window.innerWidth, h = window.innerHeight;

            // full display
            this.renderer.setViewport(0, 0, w, h);
            this.renderer.setScissor(0, 0, w, h);
            this.renderer.setScissorTest(true);
            this.renderer.render(this.scene, this.camera);

            // minimap (overhead orthogonal camera)
            if (this.Character && this.mapCamera) {
                this.renderer.setViewport(16, h-(300)-16, this.mapWidth, this.mapHeight);
                this.renderer.setScissor(16, h-(300)-16, this.mapWidth, this.mapHeight);
                this.renderer.setScissorTest(true);
                this.renderer.render(this.scene, this.mapCamera);
            }

            //cannonDebugger.update();

            //this.renderer.render(this.scene, this.camera);
            this.step(t - this.previousRAF);
            this.previousRAF = t;
        });
    }

    //updates all objects in other classes
    step(timeElapsed){
        //update to enable animations
        const timeElapsedS = timeElapsed * 0.001;

        //animate door to open
        if (opendoor) {
            if (doormixer) doormixer.update(timeElapsedS);
            setTimeout(function()
            {
                opendoor = false;
            },1500);

        }

        //update rotation of skybox for dynamic skybox
        this.Skybox.Update(timeElapsedS);

        //update character
        if (this.Character) {
            this.Character.Update(timeElapsedS);

            //Update the third person camera.
            this.CAM.Update(timeElapsedS)

            //If Game is over
            if (this.Character.getStop === true) {
                Pause = true;
            }
        }
    }

    //resize renderer canvas when window is resized
    OnWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.mapCamera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    floorTile(x,z){
        const floor = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(30,30),
            ground
        );
        floor.rotation.set(-Math.PI/2,0,0);
        floor.position.set(x,0,z);
        floor.receiveShadow = true;

        return floor;
    }

    HiddenTile(x,z){
        const hidden = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(30,30),
            hiddenTexture
        );
        hidden.rotation.set(-Math.PI/2,0,0);
        hidden.position.set(x,30,z);
        hidden.receiveShadow = true;

        return hidden;
    }

    HiddenKey(x,z){

        const hiddenKey = new THREE.Group();

        const hidden = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(30,30),
            hiddenTexture
        );
        hidden.rotation.set(-Math.PI/2,0,0);
        hidden.position.set(x,30,z);
        hidden.receiveShadow = true;

        hiddenKey.add(hidden)

        const key = this.Key(x,z);
        hiddenKey.add(key);

        return hiddenKey;
    }

    UnHiddenKey(x,z){

        const unHiddenKey = new THREE.Group();

        const unHidden = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(30,30),
            ground
        );
        unHidden.rotation.set(-Math.PI/2,0,0);
        unHidden.position.set(x,30,z);
        unHidden.receiveShadow = true;

        unHiddenKey.add( unHidden );

        const key = this.Key(x,z);
        unHiddenKey.add(key);

        return unHiddenKey;
    }

    hedgeWall(x,z){
        const wall = new THREE.Mesh(
            new THREE.BoxBufferGeometry(30,30,30),
            cubeMaterials
        );
        wall.castShadow = true;
        //wall.position.set(x,5,z);

        this.wallBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(15,15,15)),
            type: CANNON.Body.STATIC,
            position: new CANNON.Vec3(x,15,z),
        });
        //this.wallBody.position.set(x,5,z);
        this.world.addBody(this.wallBody);

        wall.position.copy(this.wallBody.position);
        wall.quaternion.copy(this.wallBody.quaternion);
    
        return wall;
    }

    Pond(x,z){
        const pond = new THREE.Group;
    
        const pond_loader = new GLTFLoader();
        pond_loader.load('../../resources/models/Pond/scene.gltf',function (gltf) {
            gltf.scene.scale.set(1,1,1); 
            //gltf.scene.position.set(x-15,0,z+15); 
            pond.add(gltf.scene);  
        },(xhr) => xhr, ( err ) => console.error( err ));

        this.pondBody = new CANNON.Body({
            shape: new CANNON.Cylinder(20,20,100,10),
            type: CANNON.Body.STATIC,
            position: new CANNON.Vec3(x,1,z),
        });
        // //this.wallBody.position.set(x,5,z);
        this.world.addBody(this.pondBody);

        pond.position.copy(this.pondBody.position);
        pond.quaternion.copy(this.pondBody.quaternion);
    
        return pond;        
    }

    door(x,z){
        door = new THREE.Group;

        const doorBack = new THREE.Mesh(
            new THREE.PlaneGeometry(10,40.7),
            new THREE.MeshBasicMaterial({color: 0x000000})
        );
        doorBack.position.set(x, 0, z+14.5);
        doorBack.rotation.y = Math.PI;
        this.scene.add(doorBack);

        door_loader = new GLTFLoader();
        door_loader.load('../../resources/models/door/scene.gltf',function (gltf) {
            gltf.scene.scale.set(0.025,0.025,0.025);
            gltf.scene.position.set(x,0,z+14);

            doormixer = new THREE.AnimationMixer(gltf.scene);
            gltf.animations.forEach((clip) => {
                doormixer.clipAction(clip).play();
            });

            let model = gltf.scene;
            door.add(model);
        },(xhr) => xhr, ( err ) => console.error( err ));

        //add a light to the door
        const door_light = new THREE.PointLight( 0xFFD700, 3, 20 );
        door_light.position.set( x,21.5,z+13 );
        door_light.add(new THREE.Mesh( new THREE.SphereGeometry( 0.5, 16, 8 ), new THREE.MeshBasicMaterial( { color: 0xFFD700 } ) ));
        this.scene.add( door_light );

        return door;
    }

    Key(x,z){
        key = new THREE.Group;
        let model;
        const triangle=this.Triangle(x,z);
        tree_loader = new GLTFLoader();
        tree_loader.load('../../resources/models/key/scene.gltf',function (gltf) {
            gltf.scene.scale.set(0.5,0.5,0.5);
            gltf.scene.position.set(x,5,z);
            model = gltf.scene;

            gsap.to(gltf.scene.position, {y:'+=5',
            duration:2, //The speed of the key 
            ease:'none',
            repeat:-1, // Reversing the action 
            yoyo:true // The yoyo effect
            })

            gsap.to(gltf.scene.rotation, {y:'+=10',
            duration:4, //The speed of the key 
            ease:'none',
            repeat:-1, // Reversing the action 
            yoyo:true // The yoyo effect
        })

        gltf.scene.traverse( function( node ) {
            if ( node.isMesh ) { node.castShadow = true; }

        } );
            
            key.add(model);
        },(xhr) => xhr, ( err ) => console.error( err ));
        return key;
    }
    Triangle(x,z){
            const triangle = new THREE.Group;
            triangle_loader = new GLTFLoader();
            triangle_loader.load('../../resources/models/triangle/scene.gltf',function (gltf) {
                gltf.scene.scale.set(5,10,5); 
                gltf.scene.position.set(x,20,z); 
        
                gltf.scene.rotation.x = (Math.PI );
                gsap.to(gltf.scene.position, {
                    y:'+=5', 
                    duration:2,
                    delay: 0, 
                    ease:'none', 
                    repeat:-1, 
                    yoyo:true
                })
                triangle.add(gltf.scene);  
            },(xhr) => xhr, ( err ) => console.error( err ));
        
            
            return triangle;
        }
    Mirror(x,z,p) {
        let mirror = new THREE.Group;
    
        let geometry;
    
        geometry = new THREE.PlaneGeometry(30,30);
        mirrorCamera = new Reflector( geometry, {
            clipBias: 0.003,
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
            color: 0x777777,
        });
    
        mirrorCamera.position.set(x-14,15,z-14);
        mirrorCamera.rotateX( p );
        mirror.add( mirrorCamera );
    
        return mirror;
    }

    Rock(x,z){
        const rock = new THREE.Group;
    
        const rock_loader = new GLTFLoader();
        rock_loader.load('../../resources/models/Rock/scene.gltf',function (gltf) {
            gltf.scene.scale.set(40,40,40); 
            //agltf.scene.scale.set(0.1,0.1,0.1); 
            //gltf.scene.position.set(x-5,0,z+2); 
            rock.add(gltf.scene);  
        },(xhr) => xhr, ( err ) => console.error( err ));

        this.rockBody = new CANNON.Body({
            shape: new CANNON.Cylinder(10,10,100,20),
            type: CANNON.Body.STATIC,
            position: new CANNON.Vec3(x,1,z),
        });
        //this.wallBody.position.set(x,5,z);
        this.world.addBody(this.rockBody);

        rock.position.copy(this.rockBody.position);
        rock.quaternion.copy(this.rockBody.quaternion);
    
        return rock;        
    }

    

    SpineGrass(x,z){
        const grass = new THREE.Group;
    
        grass_loader = new GLTFLoader();
        grass_loader.load('../../resources/models/spine_grass/scene.gltf',function (gltf) {
            gltf.scene.scale.set(2,2,2); 
            gltf.scene.position.set(x,0,z); 
            grass.add(gltf.scene);  
        },(xhr) => xhr, ( err ) => console.error( err ));
    
        return grass;
    }

    Shrub(x,z){
        const shrub = new THREE.Group;
    
        shrub_loader = new GLTFLoader();
        shrub_loader.load('../../resources/models/low_poly_shrub/scene.gltf',function (gltf) {
            gltf.scene.scale.set(25,15,25); 
            gltf.scene.position.set(x,0,z); 
            shrub.add(gltf.scene);  
        },(xhr) => xhr, ( err ) => console.error( err ));
    
        return shrub;
    }
   

    InitaliseTexture() {
        const loader = new THREE.TextureLoader();
        cubeMaterials = [
            new THREE.MeshLambertMaterial({ map: loader.load('../../resources/pictures/hedge_dark.jpg')}), //right side
            new THREE.MeshLambertMaterial({ map: loader.load('../../resources/pictures/hedge_dark.jpg')}), //left side
            new THREE.MeshBasicMaterial({ map: loader.load('../../resources/pictures/Hedge_full_perms_texture_seamless.jpg')}), //top side
            new THREE.MeshBasicMaterial({color: 'green', side: THREE.DoubleSide}), //bottom side
            new THREE.MeshLambertMaterial({ map: loader.load('../../resources/pictures/hedge_dark.jpg')}), //front side
            new THREE.MeshLambertMaterial({ map: loader.load('../../resources/pictures/hedge_dark.jpg')}), //back side
            ];
        const loaderGround = new THREE.TextureLoader();
        ground = new THREE.MeshLambertMaterial({ map: loaderGround.load('../../resources/pictures/ulrick-wery-tileableset2-soil.jpg')});
        const hiddenLoader = new THREE.TextureLoader();
        hiddenTexture = new THREE.MeshBasicMaterial({ map: hiddenLoader.load('../../resources/pictures/Hedge_full_perms_texture_seamless.jpg')});
    }

   
    addSound(){
        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        this.camera.add( listener ); // attaching the sound to the camera

        // create a global audio source
        const sound = new THREE.Audio( listener );

        // creating an audio loader
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( '../../resources/audio/birdsound.mp3', function( buffer ) { // uploading .mp3 file
            sound.setBuffer( buffer );
            sound.setLoop( true );
            sound.setVolume( 1 ); // adjusting the volume
            sound.play(); // playing the sound
            });
        
        document.addEventListener("keyup",   onDocumentKeyUp, false);    //on click handler for releasing W
        document.addEventListener("keydown", onDocumentKeyDown, false); // on click handler for pressing W

        function onDocumentKeyDown(event) { // when you press W
            var keyCode = event.which;  
            
            if (keyCode == 87) {
                sound.stop() // ambient sound stops playing
                // load a sound and set it as the Audio object's buffer
                const audioLoader = new THREE.AudioLoader();
                audioLoader.load( '../../resources/audio/woodsteps.mp3', function( buffer ) { // the audio for the footsteps
                    sound.setBuffer( buffer );
                  //  sound.setLoop( true ); // sound continues to play until infinite
                    sound.setVolume( 1 );
                    sound.play();// footstep sound start playing
                     });  
                }
                
               }

        function onDocumentKeyUp(event) { // when you release W
            var keyCode = event.which;
            
            if (keyCode == 87) {
                sound.stop() // footstep sound stops playing
                const audioLoader = new THREE.AudioLoader();
                audioLoader.load( '../../resources/audio/birdsound.mp3', function( buffer ) { // Uploading ambient files from resources
                    sound.setBuffer( buffer );
                    sound.setLoop( true );
                    sound.setVolume( 1);// setting the volume
                    sound.play(); // playing the ambient sound
                    });
            }
        }
    }
    //UI Element
    addKeyCount(){
        let img = document.createElement("img");
        img.src = "../../resources/pictures/key.png";
        img.id = "KeyIcon";

        img.setAttribute("height", "90");
        img.setAttribute("width", "90");

        let width = 200
        this.textSpan = document.createElement("span")
        this.textSpan.id = "keyCount"
        this.textSpan.style.padding = "20px"
        this.textSpan.style.fontFamily = "sans-serif"
        this.textSpan.style.color = '#ffffff'
        this.textSpan.style.fontSize = 45 + 'px'
        this.textSpan.textContent = "x" + collectedKeys.toString()+"/5"

        this.keyCount = document.createElement('div')
        this.keyCount.id = "KeyDiv"
        this.keyCount.style.position = 'absolute';
        this.keyCount.style.display = "flex";
        this.keyCount.style.alignItems = "center";
        this.keyCount.style.backgroundColor="#000000";
        this.keyCount.style.borderRadius="25px";

        this.keyCount.append(img)
        this.keyCount.append(this.textSpan)
        this.keyCount.style.top = "10%";
        this.keyCount.style.left= "100%";
        this.keyCount.style.padding="15px";
        this.keyCount.style.marginLeft= "-"+width+"px"
        this.keyCount.unselectable = "on"
        this.keyCount.style.transform="scale(0.5)";
        document.body.appendChild(this.keyCount);
    }

    //Change Text of key Counter
    updateKeyText() {

        let x = this.textSpan.textContent;
        let oldCount = x.replace(/\D/g, '');
        if (collectedKeys.toString() !== oldCount) {
            this.textSpan.textContent = "x" + collectedKeys.toString() +"/5"
        }

    }
    //UI Element
    addPauseButton() {
        let width = 100
        this.pauseIcon
            = document.createElement("input");
        this.pauseIcon
            .src = "../../resources/pictures/pause.png";
        this.pauseIcon
            .id = "pauseIcon";
        this.pauseIcon
            .style.position = 'absolute';
        this.pauseIcon
            .type = "image"
        this.pauseIcon
            .setAttribute("height", "100");
        this.pauseIcon
            .setAttribute("width", "100");

        this.pauseIcon
            .style.top = "0%";
        this.pauseIcon
            .style.left = "100%";
        this.pauseIcon.style.marginLeft= "-"+width+"px"
        this.pauseIcon.onclick = () => {
            this.onPause()
        }
        this.pauseIcon.style.transform="scale(0.5)";
        document.body.appendChild(this.pauseIcon)
    }

    //What Happens when the pause icon is clicked
    onPause() {
        Pause = true;
        let overlay = document.getElementById("myNav")
        overlay.style.width = "100%";
        let close = document.createElement('a')
        close.className = "closebtn";
        close.innerHTML = "X";
        close.style.position = "absolute";
        close.style.top = 20 + "px";
        close.style.right = 45 + "px";
        close.style.fontSize = 60 + "px";
        close.onclick = () => {
            this.onPauseExit()
        }
        overlay.append(close)
    }

    //What Happens when the pause menu is closed
    //Continue rendering game.
    onPauseExit() {
        Pause = false;
        document.getElementById("myNav").style.width = "0%";
        this.animate()
    }

    addTimer(){
        var duration = 60 * 3;
        
        var timer = duration, minutes, seconds;
        
        setInterval(function () {
            
            if(!Pause){
                const elem = document.getElementById("TimeDiv");
                if(elem != null){
                    elem.parentNode.removeChild(elem);
                }

                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                let width = innerWidth/2;
                this.TimertextSpan = document.createElement("span")
                this.TimertextSpan.id = "timer"
                this.TimertextSpan.style.padding = "20px"
                this.TimertextSpan.style.fontFamily = "sans-serif"
                this.TimertextSpan.style.color = '#ffffff'
                this.TimertextSpan.style.fontSize = 45 + 'px'
                this.TimertextSpan.textContent = minutes + ":" + seconds;

                this.timer = document.createElement('div')
                this.timer.id = "TimeDiv"
                this.timer.style.position = 'absolute';
                this.timer.style.display = "flex";
                this.timer.style.alignItems = "center";
                this.timer.style.backgroundColor="#000000";
                this.timer.style.borderRadius="25px";
                this.timer.append(this.TimertextSpan)
                this.timer.style.top = "5%";
                this.timer.style.left= "100%";
                this.timer.style.marginLeft= "-"+width+"px"
                this.timer.unselectable = "on"
                this.timer.style.transform="scale(0.5)";
                document.body.appendChild(this.timer);

                if (--timer < 0) {
                    timer=0;
                    Pause=true;
                    let LoseOverlay = document.getElementById("Lose")
                    LoseOverlay.style.width = "100%";
                    
                }
            }else{
                return;
            }
        }, 1000);
    
        
    }
}



let APP_ = null;

window.addEventListener('DOMContentLoaded', async () => {
    APP_ = new level_one();
});