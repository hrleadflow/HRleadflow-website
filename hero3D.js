/* ==========================================================================
   HRLeadFlow — Hero 3D scene
   A minimal, neutral scene combining a solar-panel array, simple
   architectural forms and a floating lead/data network — with a soft
   cursor-follow "spotlight" that brightens the panels beneath it.
   Requires THREE (r128) loaded globally before this file.
   ========================================================================== */
(function () {
  const wrap = document.getElementById('hero-canvas-wrap');
  const canvas = document.getElementById('hero-canvas');
  if (!wrap || !canvas || typeof THREE === 'undefined') {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(4.6, 3.4, 6.2);
  camera.lookAt(0, 0.2, 0);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);

  // ---- Lighting (neutral only — no colour tint) ---------------------------
  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 0.55);
  key.position.set(5, 8, 4);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffffff, 0.25);
  fill.position.set(-6, 3, -4);
  scene.add(fill);

  // ---- Ground ---------------------------------------------------------
  const groundGeo = new THREE.PlaneGeometry(24, 24);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xf1f1ee, roughness: 1, metalness: 0 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.05;
  scene.add(ground);

  // ---- Solar panel array -------------------------------------------------
  const panelGroup = new THREE.Group();
  const panelGeo = new THREE.BoxGeometry(0.92, 0.04, 0.62);
  const frameGeo = new THREE.BoxGeometry(0.98, 0.05, 0.68);
  const panels = [];

  const rows = 3, cols = 4;
  const spacingX = 1.06, spacingZ = 0.78;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const frameMat = new THREE.MeshStandardMaterial({ color: 0xe9e9e5, roughness: 0.85, metalness: 0.05 });
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x1c1c1c,
        roughness: 0.35,
        metalness: 0.4,
        emissive: 0x000000,
        emissiveIntensity: 0
      });

      const frame = new THREE.Mesh(frameGeo, frameMat);
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.y = 0.02;

      const group = new THREE.Group();
      group.add(frame);
      group.add(panel);

      group.position.set(
        (c - (cols - 1) / 2) * spacingX,
        -0.35,
        (r - (rows - 1) / 2) * spacingZ
      );
      group.rotation.x = -0.32;
      group.rotation.y = 0.08;

      panelGroup.add(group);
      panels.push({ mesh: group, panelMat, baseColor: new THREE.Color(0x1c1c1c) });
    }
  }
  panelGroup.position.set(-0.4, 0, 0.2);
  scene.add(panelGroup);

  // ---- Simple architectural forms (real estate) --------------------------
  const buildGroup = new THREE.Group();
  function makeBuilding(w, h, d, x, z) {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xfbfbfa, roughness: 0.9, metalness: 0 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.6, metalness: 0.1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
    body.position.y = h / 2;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.78, h * 0.35, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = h + (h * 0.35) / 2 - 0.02;
    const g = new THREE.Group();
    g.add(body); g.add(roof);
    g.position.set(x, -1.05, z);
    return g;
  }
  buildGroup.add(makeBuilding(0.9, 1.1, 0.9, 3.1, -1.4));
  buildGroup.add(makeBuilding(0.62, 0.75, 0.62, 3.95, -0.65));
  buildGroup.add(makeBuilding(0.7, 0.9, 0.7, 2.55, -2.3));
  scene.add(buildGroup);

  // ---- Floating lead / data network ---------------------------------------
  const netGroup = new THREE.Group();
  const nodeGeo = new THREE.SphereGeometry(0.045, 16, 16);
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.4, metalness: 0.2 });
  const nodeMatLight = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });

  const nodePositions = [
    [-1.6, 1.5, -0.4], [-0.9, 1.9, 0.6], [0.1, 2.15, -0.2],
    [1.0, 1.75, 0.5], [1.9, 2.0, -0.5], [-1.9, 0.95, 1.1]
  ];
  const nodeMeshes = nodePositions.map((p, i) => {
    const m = new THREE.Mesh(nodeGeo, i % 2 === 0 ? nodeMat : nodeMatLight);
    m.position.set(p[0], p[1], p[2]);
    netGroup.add(m);
    return m;
  });

  const lineMat = new THREE.LineBasicMaterial({ color: 0xdededa, transparent: true, opacity: 0.9 });
  const edges = [[0,1],[1,2],[2,3],[3,4],[1,5],[2,4]];
  edges.forEach(([a, b]) => {
    const g = new THREE.BufferGeometry().setFromPoints([nodeMeshes[a].position, nodeMeshes[b].position]);
    netGroup.add(new THREE.Line(g, lineMat));
  });

  // small floating "lead cards"
  const cardGeo = new THREE.PlaneGeometry(0.34, 0.22);
  const cardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0, side: THREE.DoubleSide });
  const cards = [];
  [[-1.3, 2.55, 0.1, 0.15], [0.6, 2.85, -0.15, -0.12], [1.75, 2.35, 0.25, 0.2]].forEach(([x,y,z,rot]) => {
    const c = new THREE.Mesh(cardGeo, cardMat.clone());
    c.position.set(x, y, z);
    c.rotation.set(-0.15, rot, 0.05);
    netGroup.add(c);
    cards.push({ mesh: c, baseY: y, phase: Math.random() * Math.PI * 2 });
  });

  scene.add(netGroup);

  // ---- Sizing ---------------------------------------------------------
  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ---- Cursor-follow spotlight -------------------------------------------
  // A soft "light target" in world space that panels brighten toward
  // as it nears them — smoothed with easing, auto-sweeping on mobile.
  const lightTarget = new THREE.Vector3(0, -0.35, 0);
  const lightCurrent = new THREE.Vector2(0.5, 0.45); // normalised 0..1 pointer
  const lightGoal = new THREE.Vector2(0.5, 0.45);
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  function setPointerFromEvent(clientX, clientY) {
    const rect = wrap.getBoundingClientRect();
    lightGoal.x = (clientX - rect.left) / rect.width;
    lightGoal.y = (clientY - rect.top) / rect.height;
  }

  if (!isCoarsePointer) {
    window.addEventListener('pointermove', (e) => setPointerFromEvent(e.clientX, e.clientY));
  }

  // camera parallax target
  const camGoal = new THREE.Vector2(0, 0);
  window.addEventListener('pointermove', (e) => {
    camGoal.x = (e.clientX / window.innerWidth - 0.5) * 2;
    camGoal.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const baseCamPos = camera.position.clone();
  const clock = new THREE.Clock();

  function updateSpotlight(dt, t) {
    if (isCoarsePointer) {
      // slow automatic sweep across the array
      lightGoal.x = 0.5 + Math.sin(t * 0.22) * 0.42;
      lightGoal.y = 0.45 + Math.cos(t * 0.15) * 0.12;
    }
    lightCurrent.lerp(lightGoal, prefersReducedMotion ? 1 : Math.min(1, dt * 3.2));

    // map normalised pointer to the panel array's local X/Z footprint
    const spanX = (cols - 1) * spacingX;
    const spanZ = (rows - 1) * spacingZ;
    lightTarget.x = (lightCurrent.x - 0.5) * spanX * 1.3 - 0.4;
    lightTarget.z = (lightCurrent.y - 0.5) * spanZ * 1.6;

    panels.forEach(({ mesh, panelMat }) => {
      const wp = new THREE.Vector3();
      mesh.getWorldPosition(wp);
      const d = Math.hypot(wp.x - lightTarget.x, wp.z - lightTarget.z);
      const glow = Math.max(0, 1 - d / 1.55);
      const eased = glow * glow;
      panelMat.emissive.setRGB(eased * 0.55, eased * 0.55, eased * 0.55);
      panelMat.roughness = 0.45 - eased * 0.2;
    });
  }

  // ---- Animate ---------------------------------------------------------
  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    updateSpotlight(dt, t);

    if (!prefersReducedMotion) {
      netGroup.rotation.y = Math.sin(t * 0.08) * 0.03;
      cards.forEach(({ mesh, baseY, phase }) => {
        mesh.position.y = baseY + Math.sin(t * 0.6 + phase) * 0.045;
      });

      camera.position.x = baseCamPos.x + camGoal.x * -0.35;
      camera.position.y = baseCamPos.y + camGoal.y * 0.2;
      camera.lookAt(0, 0.2, 0);

      scene.rotation.y += 0.0009;
    }

    renderer.render(scene, camera);
  }
  animate();
})();
