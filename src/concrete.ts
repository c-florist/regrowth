import * as THREE from "three";

export class Concrete {
  private material: THREE.MeshStandardMaterial;
  private group: THREE.Group;

  constructor() {
    this.material = new THREE.MeshStandardMaterial({
      color: 0x8c8c8c,
      roughness: 0.8,
      metalness: 0.1,
    });
    this.group = new THREE.Group();
  }
}
