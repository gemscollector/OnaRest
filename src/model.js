import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import vertex from './shader/vertexShader.glsl'
import fragment from './shader/fragmentShader.glsl'

class Model {
    constructor (obj) {
        console.log(obj)
        this.name = obj.name
        this.file = obj.file
        this.scene = obj.scene
        this.scale = obj.scale || 1;
        
        this.isActive = false

        this.color1 = obj.color1
        this.color2 = obj.color2
        this.color3 = obj.color3
        this.color4 = obj.color4;
        this.color5 = obj.color5;
        this.color6 = obj.color6;
        this.color7 = obj.color7;
        this.color8 = obj.color8;
        this.baseSize = obj.baseSize || 30.0;

        this.loader = new GLTFLoader()
        this.dracoLoader = new DRACOLoader()
        this.dracoLoader.setDecoderPath('./draco/')
        this.loader.setDRACOLoader(this.dracoLoader)
        
        this.init()
    }

    init() {
        this.loader.load(this.file, (response) => {

            this.model = response.scene;
            console.log(this.model);
            this.model.scale.set(this.scale, this.scale, this.scale); 
            let firstMeshFound = false;
    
            this.model.traverse((child) => {
                if (child.isMesh && !firstMeshFound) {
                    firstMeshFound = true;
                   this.particlesMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        uColor1: { value: new THREE.Color(this.color1)},
                        uColor2: { value: new THREE.Color(this.color2)},
                        uColor3: { value: new THREE.Color(this.color3) },
                        uColor4: { value: new THREE.Color(this.color4) },
                        uColor5: { value: new THREE.Color(this.color5) },
                        uColor6: { value: new THREE.Color(this.color6) },
                        uColor7: { value: new THREE.Color(this.color7) },
                        uColor8: { value: new THREE.Color(this.color8) },
                        uTime: { value: 0 },
                        uMouse: { value: new THREE.Vector2(0.0, 0.0) }, // добавили
                        uStrength: { value: 0.0 }, // силу притяжения
                        uScrollProgress: { value: 0 },
                        uBaseSize: { value: this.baseSize },
                        uHighlightTime: { value: 0 },
                    },
                    vertexShader: vertex,
                    fragmentShader: fragment,
                    transparent: true,
                    depthTest: true,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                    
                
                   })
                   child.geometry.applyMatrix4(new THREE.Matrix4().makeScale(this.scale, this.scale, this.scale));
                    const sampler = new MeshSurfaceSampler(child).build()
                    const numParticles = 20000
                    this.particlesGeometry = new THREE.BufferGeometry()
                    const particlesPosition = new Float32Array(numParticles * 3)

                    const aOffset = new Float32Array(numParticles);
                    const aFrequency = new Float32Array(numParticles);
                    const aAmplitude = new Float32Array(numParticles);
                    const aDelay = new Float32Array(numParticles);
                    for (let i = 0; i < numParticles; i++) {
                        aDelay[i] = Math.random(); // задержка в диапазоне [0, 1]
                    }
                    this.particlesGeometry.setAttribute('aDelay', new THREE.BufferAttribute(aDelay, 1));

                    for (let i = 0; i < numParticles; i++) {
                        const newPosition = new THREE.Vector3();
                        sampler.sample(newPosition);
                        particlesPosition.set([newPosition.x, newPosition.y, newPosition.z], i * 3);

                        aOffset[i] = Math.random() * Math.PI * 2;
                        aFrequency[i] = 0.5 + Math.random() * 0.5;     // от 0.5 до 2.0
                        aAmplitude[i] = 0.02 + Math.random() * 0.08;   // от 0.02 до 0.1
                    }

                    this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPosition, 3));
                    this.particlesGeometry.setAttribute('aOffset', new THREE.BufferAttribute(aOffset, 1));
                    this.particlesGeometry.setAttribute('aFrequency', new THREE.BufferAttribute(aFrequency, 1));
                    this.particlesGeometry.setAttribute('aAmplitude', new THREE.BufferAttribute(aAmplitude, 1));

                    const aInitialPosition = new Float32Array(numParticles * 3);
                    for (let i = 0; i < numParticles * 3; i++) {
                        aInitialPosition[i] = particlesPosition[i];
                    }
                    this.particlesGeometry.setAttribute('aInitialPosition', new THREE.BufferAttribute(aInitialPosition, 3));

                    for (let i = 0; i < numParticles; i++) {
                        const newPosition = new THREE.Vector3()
                        sampler.sample(newPosition)
                        particlesPosition.set([
                            newPosition.x += 0.1,
                            newPosition.y += 0.1,
                            newPosition.z -= 0.1
                        ], i * 3)
                    }
                    this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPosition, 3))
    
                    this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
                    this.scene.add(this.particles);
                    this.isActive = true
                }
            });
    
        });
    }
}
export default Model