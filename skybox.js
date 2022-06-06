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
        if(this.type === 'DaylightBox'){
            urls = [
                './resources/img/DaylightBox/Daylight Box_Right.bmp', //right
                './resources/img/DaylightBox/Daylight Box_Left.bmp', //left
                './resources/img/DaylightBox/Daylight Box_Top.bmp', //top
                './resources/img/DaylightBox/Daylight Box_Bottom.bmp', //bottom
                './resources/img/DaylightBox/Daylight Box_Front.bmp', //front
                './resources/img/DaylightBox/Daylight Box_Back.bmp', //back
            ];
        }

        let materials = [];
        for (let i = 0; i < 6; i++) {
            materials.push(new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(urls[i]),
                side: THREE.DoubleSide
            }));
        }
        let skyGeometry = new THREE.BoxGeometry(900, 900, 900);
        this.skybox = new THREE.Mesh(skyGeometry, materials);
        this.skybox.position.set(300,100,300);
        this.scene.add(this.skybox);
        return this.skybox;
    }

}

