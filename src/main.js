import * as THREE from 'three';

// ----- 3요소 세팅 시작 -----
// 씬 생성
const scene = new THREE.Scene();

// 정사영 카메라 설정
const frustumSize = 20;
const aspect = window.innerWidth / window.innerHeight;

const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2,  // left
  (frustumSize * aspect) / 2,   // right
  frustumSize / 2,              // top
  frustumSize / -2,             // bottom
  0.1,                          // near
  1000                          // far
);
camera.position.set(0, 20, 20);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// 렌더러 생성
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 윈도우 리사이즈 시 업데이트
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ----- 레이캐스터와 교차시킬 평면 추가 -----
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // x축을 기준으로 회전시켜 수평면으로 만든다.
plane.visible = false; // 레이캐스팅을 위해 렌더링되지 않도록 설정
scene.add(plane);

// ----- 큐브 오브젝트 생성 -----
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0, 0);
scene.add(cube);

// ----- 구 오브젝트 생성 -----
const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xeeff00 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(5, 0.5, 0);
scene.add(sphere);


// ----- 빛 -----
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0.5, 0.5);
scene.add(light);

// ----- 레이캐스터 및 마우스 벡터 -----
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// 클릭시 이동할 목표 위치 벡터
const targetPosition = new THREE.Vector3().copy(cube.position);

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(plane);

  if (intersects.length > 0) {
    const point = intersects[0].point;
    // cube가 바닥면 위에 올라가도록 y좌표를 0.5로 맞춤
    targetPosition.set(point.x, 0.5, point.z);
  }
});

// ----- 애니메이션 관련 변수 -----
let angle = 0;          // Sphere가 공전할 때 사용할 각도
const orbitRadius = 10;  // 공전 반지름

// 애니메이션 루프
(function animate() {
  requestAnimationFrame(animate);
  cube.position.lerp(targetPosition, 0.1);
  cube.rotation.x += 0.02;
  cube.rotation.y += 0.02;
  cube.rotation.z += 0.02;
  // Sphere를 중심(0, 0.5, 0) 주변으로 회전시키기
  angle += 0.01; // 각도를 조금씩 증가
  sphere.position.set(
    Math.cos(angle) * orbitRadius,
    0,
    Math.sin(angle) * orbitRadius
  );
  renderer.render(scene, camera);
})();
