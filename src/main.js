// import * as THREE from "./node_modules/three/build/three.min.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r112/examples/jsm/controls/OrbitControls.js";

class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedSize = 0;
    this.intersection = false;
  }
  pick(normalizedPosition, scene, camera, time) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.size = this.pickedObjectSavedSize;
      this.pickedObject = undefined;
    }

    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      this.intersection = true;
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      // save its color
      this.pickedObjectSavedSize = this.pickedObject.material.size;

      this.pickedObject.material.size = 0.05;
    } else {
      this.intersection = false;
    }
  }
  click(normalizedPosition, scene, camera, time) {
    if (this.pickedObject) {
      this.pickedObject = undefined;
    }
    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      return this.pickedObject.position;
    }
  }
}

function main() {
  const canvas = document.querySelector("#MainCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.autoClearColor = false;

  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 10;
  camera.position.y = 6;

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();

  let cameraLockEngaged = false;
  let cameraLockTarget = null;
  const pickPosition = { x: 0, y: 0 };
  const pickHelper = new PickHelper();
  clearPickPosition();

  // Extend points prototype to carry extra data for me
  THREE.Points.prototype.displacement = 0;

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  function makeInstance(color, x) {
    const sphereWidth = Math.random() + 0.5;
    const widthSegs = Math.floor(Math.random() * 50) + 5;
    const heightSegs = Math.floor(Math.random() * 50) + 5;
    const xRota = Math.random() * 360;
    const yRota = Math.random() * 360;
    const yHeight = Math.random() * 3 - 1.5;

    const geometry = new THREE.SphereGeometry(
      sphereWidth,
      widthSegs,
      heightSegs
    );
    var material = new THREE.PointsMaterial({
      color: color,
      size: 0.01
    });

    var points = new THREE.Points(geometry, material);
    points.displacement = x;
    points.position.x = x;
    points.position.y = Math.random() * 3 + 1.5;
    points.rotation.x = xRota;
    points.rotation.y = yRota;

    scene.add(points);
    return points;
  }

  const spheres = [
    makeInstance(0x1bff80, 0),
    makeInstance(0x1bff80, -5),
    makeInstance(0x1bff80, 3),
    makeInstance(0x1bff80, -7),
    makeInstance(0x1bff80, -10)
  ];

  const bgScene = new THREE.Scene();
  let bgMesh;
  {
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./img/starmap_8k.jpg");
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    const shader = THREE.ShaderLib.equirect;
    const material = new THREE.ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    });
    material.uniforms.tEquirect.value = texture;
    const plane = new THREE.BoxBufferGeometry(2, 2, 2);
    bgMesh = new THREE.Mesh(plane, material);
    bgScene.add(bgMesh);
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    let camLockPos;

    if (cameraLockEngaged) {
      camLockPos = pickHelper.click(pickPosition, scene, camera, time);
      camera.position.x = camLockPos.x;
      camera.position.y = camLockPos.y;
      camera.position.z = camLockPos.z;
    } else {
      pickHelper.pick(pickPosition, scene, camera, time);
    }
    console.log(camera.position);

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    //
    spheres.forEach((sphere, ndx) => {
      const speed = 0.3 + ndx * -0.1;
      const rot = time * speed;
      sphere.rotation.y = rot;
      sphere.position.set(
        Math.cos(time / 3) * sphere.displacement,
        sphere.position.y,
        Math.sin(time / 3) * sphere.displacement
      );
    });

    bgMesh.position.copy(camera.position);

    // composer.render();
    renderer.render(bgScene, camera);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  function getCanvasRelativePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function setPickPosition(event) {
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = (pos.x / canvas.clientWidth) * 2 - 1;
    pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1; // note we flip Y
  }

  function clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    pickPosition.x = -100000;
    pickPosition.y = -100000;
  }
  window.addEventListener("mousemove", setPickPosition);
  window.addEventListener("mouseout", clearPickPosition);
  window.addEventListener("mouseleave", clearPickPosition);
  window.addEventListener("click", e => {
    pickHelper.intersection
      ? (cameraLockEngaged = true)
      : (cameraLockEngaged = false);
  });

  window.addEventListener(
    "touchstart",
    event => {
      // prevent the window from scrolling
      event.preventDefault();
      setPickPosition(event.touches[0]);
    },
    { passive: false }
  );

  window.addEventListener("touchmove", event => {
    setPickPosition(event.touches[0]);
  });

  window.addEventListener("touchend", clearPickPosition);
}

main();
