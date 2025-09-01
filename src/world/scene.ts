import * as THREE from "three";
import { Concrete } from "../world/concrete";
import { Vine } from "./vine";

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private concreteStructure: THREE.Group;
  private growingVines: Vine[] = [];
  private clock: THREE.Clock;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcbcbcb);
    this.clock = new THREE.Clock();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.y = 12;
    this.camera.position.z = 20;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.setupLights();

    const concrete = new Concrete();
    this.concreteStructure = concrete.generate();
    this.scene.add(this.concreteStructure);

    window.addEventListener("resize", this.onWindowResize.bind(this));
    this.animate();
  }

  private setupLights() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(15, 25, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize = new THREE.Vector2(4096, 4096);
    this.scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    this.scene.add(ambientLight);
  }

  private spawnVine() {
    const raycaster = new THREE.Raycaster();
    const side = Math.floor(Math.random() * 3); // 0: top, 1: side X, 2: side Z

    switch (side) {
      case 0: {
        const x = (Math.random() - 0.5) * 15;
        const z = (Math.random() - 0.5) * 15;
        raycaster.set(new THREE.Vector3(x, 20, z), new THREE.Vector3(0, -1, 0));
        break;
      }
      case 1: {
        const y = Math.random() * 10;
        const z = (Math.random() - 0.5) * 15;
        const dir = Math.random() > 0.5 ? 1 : -1;
        raycaster.set(
          new THREE.Vector3(dir * 20, y, z),
          new THREE.Vector3(-dir, 0, 0),
        );
        break;
      }
      case 2: {
        const x = (Math.random() - 0.5) * 15;
        const y = Math.random() * 10;
        const dir = Math.random() > 0.5 ? 1 : -1;
        raycaster.set(
          new THREE.Vector3(x, y, dir * 20),
          new THREE.Vector3(0, 0, -dir),
        );
        break;
      }
    }

    const intersects = raycaster.intersectObjects(
      this.concreteStructure.children,
    );

    if (intersects.length > 0) {
      const startIntersect = intersects[0];
      if (!startIntersect) return;

      const startPoint = startIntersect.point;
      const startNormal = startIntersect.face?.normal;
      if (!startNormal) return;

      const vine = new Vine(
        this.concreteStructure.children,
        startPoint,
        startNormal,
      );
      this.growingVines.push(vine);
      this.scene.add(vine.mesh);
    }
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    const delta = this.clock.getDelta();

    if (Math.random() > 0.99) {
      this.spawnVine();
    }

    for (const vine of this.growingVines) {
      vine.update(delta);
    }

    this.growingVines = this.growingVines.filter((vine) => !vine.isFinished);

    this.renderer.render(this.scene, this.camera);
  }
}
