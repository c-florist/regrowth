import * as THREE from "three";
import { Concrete } from "../world/concrete";
import { Tower } from "./tower";
import { Vine } from "./vine";

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private towers: Tower[] = [];
  private growingVines: Vine[] = [];
  private clock: THREE.Clock;
  private groundPlane: THREE.Mesh;

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
    this.camera.position.y = 20;
    this.camera.position.z = 35;
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.setupLights();

    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a5a5a,
      roughness: 0.9,
    });
    this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    this.groundPlane.rotation.x = -Math.PI / 2;
    this.groundPlane.receiveShadow = true;
    this.scene.add(this.groundPlane);

    const concrete = new Concrete();
    this.towers = concrete.towers;
    this.scene.add(...concrete.getMeshes());

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
    if (this.towers.length === 0) {
      return;
    }

    const tower = this.towers[
      Math.floor(Math.random() * this.towers.length)
    ] as Tower;
    if (!tower) return;

    const raycaster = new THREE.Raycaster();
    const towerPos = tower.mesh.position;
    const towerGeo = tower.mesh.geometry as THREE.BoxGeometry;
    const towerWidth = towerGeo.parameters.width;
    const towerHeight = towerGeo.parameters.height;
    const towerDepth = towerGeo.parameters.depth;

    const side = Math.floor(Math.random() * 5);
    const startPos = new THREE.Vector3();
    const direction = new THREE.Vector3();

    const spawnHeight = Math.random() * 2 + 0.5;

    // 0: +X, 1: -X, 2: +Z, 3: -Z, 4: Top
    switch (side) {
      case 0:
        startPos.set(towerPos.x + towerWidth / 2 + 10, spawnHeight, towerPos.z);
        direction.set(-1, 0, 0);
        break;
      case 1:
        startPos.set(towerPos.x - towerWidth / 2 - 10, spawnHeight, towerPos.z);
        direction.set(1, 0, 0);
        break;
      case 2:
        startPos.set(towerPos.x, spawnHeight, towerPos.z + towerDepth / 2 + 10);
        direction.set(0, 0, -1);
        break;
      case 3:
        startPos.set(towerPos.x, spawnHeight, towerPos.z - towerDepth / 2 - 10);
        direction.set(0, 0, 1);
        break;
      case 4:
        startPos.set(towerPos.x, towerPos.y + towerHeight / 2 + 10, towerPos.z);
        direction.set(0, -1, 0);
        break;
    }

    raycaster.set(startPos, direction);

    const objectsToIntersect = [
      ...this.towers.map((t) => t.mesh),
      this.groundPlane,
    ];
    const intersects = raycaster.intersectObjects(objectsToIntersect);

    if (intersects.length > 0) {
      const startIntersect = intersects[0];
      if (!startIntersect) return;

      const startPoint = startIntersect.point;
      const startNormal = startIntersect.face?.normal;
      if (!startNormal) return;

      const vine = new Vine(objectsToIntersect, startPoint, startNormal);
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

    this.spawnVine();

    for (const vine of this.growingVines) {
      vine.update(delta);
    }

    for (const tower of this.towers) {
      tower.update(delta);
    }

    this.growingVines = this.growingVines.filter((vine) => !vine.isFinished);

    const crumblingTowers = this.towers.filter((tower) => tower.isCrumbling);
    for (const tower of crumblingTowers) {
      if (tower.mesh.position.y < -10) {
        this.scene.remove(tower.mesh);
      }
    }
    this.towers = this.towers.filter(
      (tower) => !tower.isCrumbling || tower.mesh.position.y > -10,
    );

    if (this.towers.length < 200) {
      const width = Math.random() * 3 + 1;
      const height = Math.random() * 15 + 2.2;
      const depth = Math.random() * 3 + 1;
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 50,
        height / 2,
        (Math.random() - 0.5) * 50,
      );

      const tower = new Tower(position, width, height, depth);
      this.towers.push(tower);
      this.scene.add(tower.mesh);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
