import * as THREE from "three";
import { Tower } from "./tower";

const NUM_CONCRETE_TOWERS = 200;
const CITY_WIDTH = 50;
const CITY_DEPTH = 50;

export class Concrete {
  towers: Tower[] = [];

  constructor() {
    for (let i = 0; i < NUM_CONCRETE_TOWERS; i++) {
      const width = Math.random() * 3 + 1;
      const height = Math.random() * 15 + 2.2;
      const depth = Math.random() * 3 + 1;
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * CITY_WIDTH,
        height / 2,
        (Math.random() - 0.5) * CITY_DEPTH,
      );

      const tower = new Tower(position, width, height, depth);
      this.towers.push(tower);
    }
  }

  getMeshes() {
    return this.towers.map((tower) => tower.mesh);
  }
}
