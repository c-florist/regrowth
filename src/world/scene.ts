import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Concrete } from "../world/concrete";
import { Vine } from "./vine";

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private concreteStructure: THREE.Group;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcbcbcb);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.z = 15;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.setupLights();

    const concrete = new Concrete();
    this.concreteStructure = concrete.generate();
    this.scene.add(this.concreteStructure);

    const vineGrowth = this.startVineGrowth();
    this.scene.add(vineGrowth);

    window.addEventListener("resize", this.onWindowResize.bind(this));
    this.animate();
  }

  private setupLights() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(10, 15, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize = new THREE.Vector2(2048, 2048);
    this.scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);
  }

  private startVineGrowth() {
    const raycaster = new THREE.Raycaster();
    raycaster.set(new THREE.Vector3(0, 20, 0), new THREE.Vector3(0, -1, 0));

    const intersects = raycaster.intersectObjects(
      this.concreteStructure.children,
    );

    if (intersects.length > 0) {
      const startIntersect = intersects[0];
      if (!startIntersect) {
        throw new Error("No starting intersection found");
      }

      const startPoint = startIntersect.point;
      const startNormal = startIntersect.face?.normal;
      if (!startNormal) {
        throw new Error("No starting normal found");
      }

      const vine = new Vine(this.concreteStructure.children);
      const vineGrowth = vine.grow(startPoint, startNormal, 10);
      if (!vineGrowth) {
        throw new Error("Vine growth failed");
      }

      return vineGrowth;
    } else {
      throw new Error("No intersection found");
    }
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
