import * as THREE from "three";
import { LSystem } from "../systems/l-system";

export class Vine {
  private objectsToIntersect: THREE.Object3D[];
  private lSystem: LSystem;
  private material: THREE.MeshBasicMaterial;

  constructor(objectsToIntersect: THREE.Object3D[]) {
    this.objectsToIntersect = objectsToIntersect;
    this.lSystem = new LSystem("F", new Map([["F", "F[+F]F[-F]F"]]));
    this.material = new THREE.MeshBasicMaterial({ color: 0x17ac17 });
  }

  grow(
    startPoint: THREE.Vector3,
    startNormal: THREE.Vector3,
    iterations: number,
  ) {
    this.lSystem.generate(iterations);

    const raycaster = new THREE.Raycaster();
    const points: THREE.Vector3[] = [];
    const stateStack: {
      pos: THREE.Vector3;
      dir: THREE.Vector3;
      normal: THREE.Vector3;
    }[] = [];

    let currentPos = startPoint.clone();
    let currentNormal = startNormal.clone();

    let currentDir = new THREE.Vector3();
    const arbitraryVec = new THREE.Vector3(0, 1, 0);
    currentDir.crossVectors(startNormal, arbitraryVec).normalize();

    if (currentDir.lengthSq() < 0.001) {
      arbitraryVec.set(1, 0, 0);
      currentDir.crossVectors(startNormal, arbitraryVec).normalize();
    }

    for (const char of this.lSystem.sentence) {
      switch (char) {
        case "F": {
          const moveDistance = 0.5;
          const nextPos = currentPos
            .clone()
            .add(currentDir.clone().multiplyScalar(moveDistance));

          raycaster.set(nextPos, currentNormal.clone().negate());

          const intersects = raycaster.intersectObjects(
            this.objectsToIntersect,
          );

          if (intersects.length > 0) {
            const currentIntersect = intersects[0];
            if (!currentIntersect) {
              continue;
            }

            currentPos = currentIntersect.point;
            points.push(currentPos.clone());
            if (currentIntersect.face) {
              currentNormal = currentIntersect.face.normal.clone();
            }
          }

          break;
        }

        case "+": {
          currentDir.applyAxisAngle(currentNormal, -Math.PI / 4);
          break;
        }

        case "-": {
          currentDir.applyAxisAngle(currentNormal, Math.PI / 4);
          break;
        }

        case "[": {
          stateStack.push({
            pos: currentPos.clone(),
            dir: currentDir.clone(),
            normal: currentNormal.clone(),
          });
          break;
        }

        case "]": {
          const state = stateStack.pop();
          if (state) {
            currentPos = state.pos;
            currentDir = state.dir;
            currentNormal = state.normal;
          }
          break;
        }
      }
    }

    if (points.length > 1) {
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
      const vineMesh = new THREE.Mesh(geometry, this.material);

      return vineMesh;
    } else {
      return null;
    }
  }
}
