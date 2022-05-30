import * as THREE from 'three';

export class skybox {
    constructor(params) {
        this.init(params);
    }

    init(params){
        this.scene = params.scene;
        this.type = params.type;
    }

    function
    makeSkybox() {

        let urls = [];
        if (this.type === 'night'){
             urls = [
                './resources/images/nightsky/negZ.png',
                './resources/images/nightsky/posZ.png',
                './resources/images/nightsky/posY.png',
                './resources/images/nightsky/negY.png',
                './resources/images/nightsky/posX.png',
                './resources/images/nightsky/negX.png',
            ];
        }

        let materials = [];
        for (let i = 0; i < 6; i++) {
            materials.push(new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(urls[i]),
                side: THREE.DoubleSide
            }));
        }
        let skyGeometry = new THREE.BoxGeometry(400, 400, 400);
        this.skybox = new THREE.Mesh(skyGeometry, materials);
        this.scene.add(this.skybox);
        return this.skybox;
    }

}

