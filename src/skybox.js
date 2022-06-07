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
        if(this.type === 'DaylightBox'){
            urls = [
                '../../resources/pictures/DaylightBox/Daylight Box_Right.bmp', //right
                '../../resources/pictures/DaylightBox/Daylight Box_Left.bmp', //left
                '../../resources/pictures/DaylightBox/Daylight Box_Top.bmp', //top
                '../../resources/pictures/DaylightBox/Daylight Box_Bottom.bmp', //bottom
                '../../resources/pictures/DaylightBox/Daylight Box_Front.bmp', //front
                '../../resources/pictures/DaylightBox/Daylight Box_Back.bmp', //back
            ];
        }
        if(this.type === 'MountainBox'){
            urls = [
                '../../resources/pictures/MountainBox/rainbow_rt.png', //right
                '../../resources/pictures/MountainBox/rainbow_lf.png', //left
                '../../resources/pictures/MountainBox/rainbow_up.png', //top
                '../../resources/pictures/MountainBox/rainbow_dn.png', //bottom
                '../../resources/pictures/MountainBox/rainbow_ft.png', //front
                '../../resources/pictures/MountainBox/rainbow_bk.png', //back
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
