import * as THREE from "three";

const NUM_CONCRETE_TOWERS = 200;
const CITY_WIDTH = 50;
const CITY_DEPTH = 50;

export class Concrete {
  private material: THREE.MeshStandardMaterial;
  private group: THREE.Group;

  constructor() {
    this.material = new THREE.MeshStandardMaterial({
      color: 0x757575,
      roughness: 0.8,
      metalness: 0.1,
    });
    this.group = new THREE.Group();
  }

  generate() {
    for (let i = 0; i < NUM_CONCRETE_TOWERS; i++) {
      const width = Math.random() * 3 + 1;
      const height = Math.random() * 15 + 2.2;
      const depth = Math.random() * 3 + 1;

      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        this.material,
      );
      tower.castShadow = true;
      tower.receiveShadow = true;

      tower.position.set(
        (Math.random() - 0.5) * CITY_WIDTH,
        height / 2,
        (Math.random() - 0.5) * CITY_DEPTH,
      );

      this.group.add(tower);
    }

    return this.group;
  }
}
