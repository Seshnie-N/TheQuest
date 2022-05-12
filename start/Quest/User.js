import { Group, 
         
		 LoopOnce,
         Quaternion,
         Raycaster,
         AnimationMixer, 
          } from '../../libs/three137/three.module.js';
import { GLTFLoader } from '../../libs/three137/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three137/DRACOLoader.js';

class User{
    constructor(game, pos, heading){
        this.root = new Group();
        this.root.position.copy( pos );
        this.root.rotation.set( 0, heading, 0, 'XYZ' );

        this.game = game;

        this.camera = game.camera;
        this.raycaster = new Raycaster();

        game.scene.add(this.root);
        this.loadingBar = game.loadingBar;
        this.load();

        this.initMouseHandler();
    }

    initMouseHandler(){
		this.game.renderer.domElement.addEventListener( 'click', raycast, false );
			
    	const self = this;
    	const mouse = { x:0, y:0 };
    	
    	function raycast(e){
    		
			mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

			//2. set the picking ray from the camera position and mouse coordinates
			self.raycaster.setFromCamera( mouse, self.game.camera );    

			//3. compute intersections
			const intersects = self.raycaster.intersectObject( self.game.navmesh );
			
			if (intersects.length>0){
				const pt = intersects[0].point;
				console.log(pt);

				self.root.position.copy(pt);
			}	
		}
    }

    set position(pos){
        this.root.position.copy( pos );
    }
	
    load(){
    	const loader = new GLTFLoader( ).setPath(`${this.game.assetsPath}factory/`);
		const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '../../libs/three137/draco/' );
        loader.setDRACOLoader( dracoLoader );
        
        // Load a glTF resource
		loader.load(
			// resource URL
			'avatar.glb',
			// called when the resource is loaded
			gltf => {
				this.root.add( gltf.scene );
                this.object = gltf.scene;

                const scale = 1;
                this.object.scale.set(scale, scale, scale);

              
                this.animations = {};

                gltf.animations.forEach( animation => {
                    this.animations[animation.name.toLowerCase()] = animation;
                })

                this.mixer = new AnimationMixer(gltf.scene);
            
                this.action = 'Idle';

				this.ready = true;
    		},
			// called while loading is progressing
			xhr => {
				this.loadingBar.update( 'user', xhr.loaded, xhr.total );
			},
			// called when loading has errors
			err => {
				console.error( err );
			}
		);
	}

    set action(name){
		if (this.actionName == name.toLowerCase()) return;
				
		const clip = this.animations[name.toLowerCase()];

		if (clip!==undefined){
			const action = this.mixer.clipAction( clip );
			if (name=='shot'){
				action.clampWhenFinished = true;
				action.setLoop( LoopOnce );
			}
			action.reset();
			const nofade = this.actionName == 'shot';
			this.actionName = name.toLowerCase();
			action.play();
			if (this.curAction){
				if (nofade){
					this.curAction.enabled = false;
				}else{
					this.curAction.crossFadeTo(action, 0.5);
				}
			}
			this.curAction = action;
			if (this.rifle && this.rifleDirection){
				const q = this.rifleDirection[name.toLowerCase()];
				if (q!==undefined){
					const start = new Quaternion();
					start.copy(this.rifle.quaternion);
					this.rifle.quaternion.copy(q);
					this.rifle.rotateX(1.57);
					const end = new Quaternion();
					end.copy(this.rifle.quaternion);
					this.rotateRifle = { start, end, time:0 };
					this.rifle.quaternion.copy( start );
				}
			}
		}
	}
	
	update(dt){
		if (this.mixer) this.mixer.update(dt);
		if (this.rotateRifle !== undefined){
			this.rotateRifle.time += dt;
			if (this.rotateRifle.time > 0.5){
				this.rifle.quaternion.copy( this.rotateRifle.end );
				delete this.rotateRifle;
			}else{
				this.rifle.quaternion.slerpQuaternions(this.rotateRifle.start, this.rotateRifle.end, this.rotateRifle.time * 2);
			}
		}
    }
}

export { User };