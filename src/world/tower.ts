import * as THREE from "three";

const TOWER_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0x757575,
  roughness: 0.8,
  metalness: 0.1,
});

export class Tower {
  mesh: THREE.Mesh;
  vineMass = 0;
  isCrumbling = false;

  private totalMass: number;

  constructor(
    position: THREE.Vector3,
    width: number,
    height: number,
    depth: number,
  ) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    this.mesh = new THREE.Mesh(geometry, TOWER_MATERIAL);
    this.mesh.position.copy(position);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.totalMass = width * height * depth;
    this.mesh.userData["tower"] = this;
  }

  addVineMass(mass: number) {
    this.vineMass += mass;
    if (this.vineMass > this.totalMass) {
      this.isCrumbling = true;
    }
  }

  update(delta: number) {
    if (this.isCrumbling) {
      this.mesh.position.y -= 9.8 * delta;
    }
  }
}
