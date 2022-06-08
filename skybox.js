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
        if (this.type === 'day') {
            urls = [
                './resources/img/day2/px.png', //px
                './resources/img/day2/nx.png', //nx
                './resources/img/day2/py.png', //py
                './resources/img/day2/ny.png', //ny
                './resources/img/day2/pz.png', //pz
                './resources/img/day2/nz.png', //nz
            ];
        }

        let materials = [];
        for (let i = 0; i < 6; i++) {
            materials.push(new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(urls[i]),
                side: THREE.DoubleSide
            }));
        }
        let skyGeometry = new THREE.BoxGeometry(1300, 1300, 1300);
        this.skybox = new THREE.Mesh(skyGeometry, materials);
        this.skybox.position.set(400, 200, 400);
        this.scene.add(this.skybox);
        return this.skybox;
    }

}

