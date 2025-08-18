import * as THREE from "three";
import { LSystem } from "../systems/l-system";

export class Vine {
  private scene: THREE.Scene;
  private objectsToIntersect: THREE.Object3D[];
  private lSystem: LSystem;
  private material: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene, objectsToIntersect: THREE.Object3D[]) {
    this.scene = scene;
    this.objectsToIntersect = objectsToIntersect;
    this.lSystem = new LSystem("F", new Map([["F", "F[+F]F[-F]F"]]));
    this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  }
}
