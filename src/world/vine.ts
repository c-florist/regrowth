import * as THREE from "three";
import { LSystem } from "../systems/l-system";

const VINE_RADIUS = 0.05;

export class Vine {
  mesh: THREE.Group;
  isFinished = false;

  private objectsToIntersect: THREE.Object3D[];
  private lSystem: LSystem;
  private material: THREE.MeshBasicMaterial;
  private sentence: string;
  private growthIndex = 0;
  private growthAccumulator = 0;
  private growthSpeed = 20; // Segments per second

  private points: THREE.Vector3[] = [];
  private stateStack: {
    pos: THREE.Vector3;
    dir: THREE.Vector3;
    normal: THREE.Vector3;
  }[] = [];

  private currentPos: THREE.Vector3;
  private currentDir: THREE.Vector3;
  private currentNormal: THREE.Vector3;

  constructor(
    objectsToIntersect: THREE.Object3D[],
    startPoint: THREE.Vector3,
    startNormal: THREE.Vector3,
  ) {
    this.objectsToIntersect = objectsToIntersect;
    this.lSystem = new LSystem("F", new Map([["F", "FF+-FF[F+]-FFF+F"]]));
    this.lSystem.generate(4);
    this.sentence = this.lSystem.sentence;

    this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.mesh = new THREE.Group();

    this.currentPos = startPoint.clone();
    this.points.push(this.currentPos.clone());
    this.currentNormal = startNormal.clone();

    this.currentDir = new THREE.Vector3();
    const arbitraryVec = new THREE.Vector3(0, 1, 0);
    this.currentDir.crossVectors(startNormal, arbitraryVec).normalize();

    if (this.currentDir.lengthSq() < 0.001) {
      arbitraryVec.set(1, 0, 0);
      this.currentDir.crossVectors(startNormal, arbitraryVec).normalize();
    }
  }

  update(delta: number) {
    if (this.isFinished) {
      return;
    }

    this.growthAccumulator += delta * this.growthSpeed;

    while (this.growthAccumulator >= 1 && !this.isFinished) {
      const char = this.sentence[this.growthIndex];

      switch (char) {
        case "F": {
          const moveDistance = 0.5;
          const nextPos = this.currentPos
            .clone()
            .add(this.currentDir.clone().multiplyScalar(moveDistance));

          const raycaster = new THREE.Raycaster();
          raycaster.set(nextPos, this.currentNormal.clone().negate());

          const intersects = raycaster.intersectObjects(
            this.objectsToIntersect,
          );

          if (intersects.length > 0) {
            const intersect = intersects[0];
            if (!intersect) break;

            const previousPoint = this.currentPos.clone();
            this.currentPos = intersect.point;
            this.points.push(this.currentPos.clone());

            if (intersect.face) {
              this.currentNormal = intersect.face.normal.clone();
            }

            this.addVineSegment(previousPoint, this.currentPos);

            // Add a small random winding turn
            const randomWindingAngle = (Math.random() - 0.5) * (Math.PI / 8);
            this.currentDir.applyAxisAngle(
              this.currentNormal,
              randomWindingAngle,
            );
          }
          break;
        }
        case "+": {
          this.currentDir.applyAxisAngle(
            this.currentNormal,
            -(Math.PI / 8) * (Math.random() * 0.5 + 0.75),
          );
          break;
        }
        case "-": {
          this.currentDir.applyAxisAngle(
            this.currentNormal,
            (Math.PI / 8) * (Math.random() * 0.5 + 0.75),
          );
          break;
        }
        case "[": {
          this.stateStack.push({
            pos: this.currentPos.clone(),
            dir: this.currentDir.clone(),
            normal: this.currentNormal.clone(),
          });
          break;
        }
        case "]": {
          const state = this.stateStack.pop();
          if (state) {
            this.currentPos = state.pos;
            this.currentDir = state.dir;
            this.currentNormal = state.normal;
          }
          break;
        }
      }

      this.growthIndex++;
      if (this.growthIndex >= this.sentence.length) {
        this.isFinished = true;
      }
      this.growthAccumulator -= 1;
    }
  }

  private addVineSegment(start: THREE.Vector3, end: THREE.Vector3) {
    const distance = start.distanceTo(end);
    if (distance < 0.01) return;

    const geometry = new THREE.CylinderGeometry(
      VINE_RADIUS,
      VINE_RADIUS,
      distance,
      8,
    );
    const segment = new THREE.Mesh(geometry, this.material);

    const midpoint = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);
    segment.position.copy(midpoint);

    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction,
    );
    segment.setRotationFromQuaternion(quaternion);

    this.mesh.add(segment);
  }
}
