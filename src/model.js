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
    /* 
                    const particleMaterial = new THREE.PointsMaterial({
                        color: 'blue',
                        wireframe: true
                    }); */
                   /*  this.particlesMaterial = new THREE.PointsMaterial({
                        color: 'red',
                        size: 0.001
                    }) */
                   this.particlesMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        uColor1: { value: new THREE.Color(this.color1)},
                        uColor2: { value: new THREE.Color(this.color2)},
                        uTime: { value: 0 }
                    },
                    vertexShader: vertex,
                    fragmentShader: fragment,
                    transparent: true,
                    depthTest: false,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending
                
                   })
                   child.geometry.applyMatrix4(new THREE.Matrix4().makeScale(this.scale, this.scale, this.scale));
                    const sampler = new MeshSurfaceSampler(child).build()
                    const numParticles = 30000
                    this.particlesGeometry = new THREE.BufferGeometry()
                    const particlesPosition = new Float32Array(numParticles * 3)
/* Хаотичное движение */
                    const aOffset = new Float32Array(numParticles);

                    const aFrequency = new Float32Array(numParticles);

                    const aAmplitude = new Float32Array(numParticles);

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

                    for (let i = 0; i < numParticles; i++) {
                        const newPosition = new THREE.Vector3()
                        sampler.sample(newPosition)
                        particlesPosition.set([
                            newPosition.x -= 0.2,
                            newPosition.y += 0.05,
                            newPosition.z -= 0.2
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