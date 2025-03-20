import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import vertex from './shader/vertexShader.glsl'
import fragment from './shader/fragmentShader.glsl'

class Model {
    constructor (obj) {
        console.log(obj)
        this.nane = obj.name
        this.file = obj.file
        this.scene = obj.scene

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
    
            let firstMeshFound = false;
    
            this.model.traverse((child) => {
                if (child.isMesh && !firstMeshFound) {
                    firstMeshFound = true;
    
                    const particleMaterial = new THREE.PointsMaterial({
                        color: 'blue',
                        wireframe: true
                    });
                   /*  this.particlesMaterial = new THREE.PointsMaterial({
                        color: 'red',
                        size: 0.001
                    }) */
                   this.particlesMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        uColor1: { value: new THREE.Color(this.color1)},
                        uColor2: { value: new THREE.Color(this.color2)},
                    },
                    vertexShader: vertex,
                    fragmentShader: fragment,
                    transparent: true,
                
                   })

                    const sampler = new MeshSurfaceSampler(child).build()
                    const numParticles = 50000
                    this.particlesGeometry = new THREE.BufferGeometry()
                    const particlesPosition = new Float32Array(numParticles * 3)

                    for (let i = 0; i < numParticles; i++) {
                        const newPosition = new THREE.Vector3()
                        sampler.sample(newPosition)
                        particlesPosition.set([
                            newPosition.x,
                            newPosition.y,
                            newPosition.z
                        ], i * 3)
                    }
                    this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPosition, 3))
    
                    this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
                    this.scene.add(this.particles);
                }
            });
    
        });
    }
}
export default Model