import * as THREE from "three";

const NUM_CONCRETE_TOWERS = 20;

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
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(15, 1, 15),
      this.material,
    );
    base.receiveShadow = true;
    this.group.add(base);

    for (let i = 0; i < NUM_CONCRETE_TOWERS; i++) {
      const width = Math.random() * 2 + 1;
      const height = Math.random() * 8 + 4;
      const depth = Math.random() * 2 + 1;

      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        this.material,
      );
      tower.castShadow = true;
      tower.receiveShadow = true;

      tower.position.set(
        (Math.random() - 0.5) * 9,
        height / 2 + 0.5,
        (Math.random() - 0.5) * 9,
      );

      this.group.add(tower);
    }

    return this.group;
  }
}
