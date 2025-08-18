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

  grow(
    startPoint: THREE.Vector3,
    startNormal: THREE.Vector3,
    iterations: number,
  ) {
    this.lSystem.generate(iterations);

    const raycaster = new THREE.Raycaster();
    const points: THREE.Vector3[] = [];
    const stateStack: { pos: THREE.Vector3; dir: THREE.Vector3 }[] = [];

    let currentPos = startPoint.clone();
    let currentDir = new THREE.Vector3(0, 1, 0);

    const initialQuaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      startNormal,
    );
    currentDir.applyQuaternion(initialQuaternion);

    for (const char of this.lSystem.sentence) {
      switch (char) {
        case "F": {
          const moveDistance = 0.5;
          const nextPos = currentPos
            .clone()
            .add(currentDir.clone())
            .multiplyScalar(moveDistance);

          raycaster.set(nextPos, startNormal.clone().negate());

          const intersects = raycaster.intersectObjects(
            this.objectsToIntersect,
          );

          if (intersects.length > 0) {
            const currentIntersect = intersects[0];
            if (!currentIntersect) {
              continue;
            }

            points.push(currentIntersect.point.clone());
          }

          break;
        }

        case "+": {
          currentDir.applyAxisAngle(startNormal, -Math.PI / 4);
          break;
        }

        case "-": {
          currentDir.applyAxisAngle(startNormal, Math.PI / 4);
          break;
        }

        case "[": {
          stateStack.push({ pos: currentPos.clone(), dir: currentDir.clone() });
          break;
        }

        case "]": {
          const state = stateStack.pop();
          if (state) {
            currentPos = state.pos;
            currentDir = state.dir;
          }
          break;
        }
      }
    }

    if (points.length > 1) {
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
      const vineMesh = new THREE.Mesh(geometry, this.material);
      this.scene.add(vineMesh);
    }
  }
}
