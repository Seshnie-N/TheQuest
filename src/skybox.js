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
                '../../resources/pictures/nightsky/negZ.png',
                '../../resources/pictures/nightsky/posZ.png',
                '../../resources/pictures/nightsky/posY.png',
                '../../resources/pictures/nightsky/negY.png',
                '../../resources/pictures/nightsky/posX.png',
                '../../resources/pictures/nightsky/negX.png',
            ];
        }

        let materials = [];
        for (let i = 0; i < 6; i++) {
            materials.push(new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(urls[i]),
                side: THREE.DoubleSide
            }));
        }
        let skyGeometry = new THREE.BoxGeometry(900, 500, 900);
        this.skybox = new THREE.Mesh(skyGeometry, materials);
        this.skybox.position.set(300,100,300);
        this.scene.add(this.skybox);
        return this.skybox;
    }

}
