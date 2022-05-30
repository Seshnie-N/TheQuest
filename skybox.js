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
            './resources/img/skybox/side2.png', //right
            './resources/img/skybox/side4.png', //left
            './resources/img/skybox/top.png', //top
            './resources/img/skybox/bottom.png', //bottom
            './resources/img/skybox/side1.png', //front 
            './resources/img/skybox/side3.png', //back
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
        this.skybox.position.set(100,100,100);
        this.scene.add(this.skybox);
        return this.skybox;
    }

    Update(timeElapsed) {

    }

}

