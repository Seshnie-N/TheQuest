import * as THREE from 'three';

export class skybox {
    constructor(params) {
        this.init(params);
    }

    init(params){
        this.scene = params.scene;
    }

    function
    makeSkybox() {
        const urls = [
            './resources/images/nightsky/negZ.png',
            './resources/images/nightsky/posZ.png',
            './resources/images/nightsky/posY.png',
            './resources/images/nightsky/negY.png',
            './resources/images/nightsky/posX.png',
            './resources/images/nightsky/negX.png',
        ];

        var materials = [];
        for (var i = 0; i < 6; i++) {
            materials.push(new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(urls[i]),
                side: THREE.DoubleSide
            }));
        }
        var skyGeometry = new THREE.BoxGeometry(400, 400, 400);
        this.skybox = new THREE.Mesh(skyGeometry, materials);
        this.scene.add(this.skybox);
        return this.skybox;
    }

    Update(timeElapsed) {

    }

}

