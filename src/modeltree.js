import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
/* import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
 */
class modeltree {
  constructor(obj) {
    this.name = obj.name;
    this.file = obj.file;
    this.scene = obj.scene;
    this.scale = obj.scale || 1;

    this.loader = new GLTFLoader();
 /*    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./draco/');
    this.loader.setDRACOLoader(dracoLoader); */

    this.init();
  }

  init() {
    this.loader.load(this.file, (gltf) => {
        this.model = gltf.scene;
      
        // 🔧 Настройка материалов — убираем блеск и добавляем шершавость
        this.model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.roughness = 1.0;      // максимальная шершавость
            child.material.metalness = 0.0;      // без блеска
            child.material.envMapIntensity = 0;  // отключить влияние окружения, если есть
            child.material.needsUpdate = true;
          }
        });
      
        this.model.scale.set(this.scale, this.scale, this.scale);
        this.model.position.set(0, 0, 0);
        this.scene.add(this.model);
      });
  }
}

export default modeltree;