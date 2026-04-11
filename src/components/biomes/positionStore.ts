import * as THREE from 'three';

// 极致简单的位置存储，避免使用 React State 触发大规模重绘
export const positionStore = {
  playerPos: new THREE.Vector3(0, 0, 0),
};
