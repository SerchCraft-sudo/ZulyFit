import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = (s) => document.querySelector(s);
const canvas = $('#trainerCanvas');
const dialog = $('#trainerDialog');
if (!canvas || !dialog) console.warn('ZulyFit: no se encontró el visor 3D.');

let selected = localStorage.getItem('zulyfit-trainer') || 'female';
let scene, camera, renderer, rig, raf = 0, lastTime = 0, elapsed = 0;
let currentMove = 'squat', paused = false, speed = 1;
let joints = {};

const mat = (color, roughness=.72, metalness=0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });
const palette = {
  skin: mat('#efc3a6'), hair: mat('#35232b'), shirt: mat('#211d29'),
  pants: mat('#24212d'), accent: mat('#f04491'), shoe: mat('#f5eff4'),
  eye: mat('#30212a'), trim: mat('#ff83b8')
};
const sphere = (parent, x,y,z, sx,sy,sz, material) => {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1,24,18), material);
  mesh.position.set(x,y,z); mesh.scale.set(sx,sy,sz); parent.add(mesh); return mesh;
};
function capsule(parent, length, radius, material, endRadius=radius*.82) {
  const group = new THREE.Group(); parent.add(group);
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(endRadius,radius,Math.max(.02,length-radius),18), material
  );
  cylinder.position.y = -length/2; group.add(cylinder);
  sphere(group,0,0,0,radius,radius,radius,material);
  sphere(group,0,-length,0,endRadius,endRadius,endRadius,material);
  return group;
}
function makeRig() {
  rig = new THREE.Group(); scene.add(rig);
  joints = {};
  const female = selected === 'female';
  // Pelvis and torso
  sphere(rig,0,1.08,0,.31,.20,.20,palette.pants);
  const torso = sphere(rig,0,1.57,0,.34,.49,.22,palette.shirt);
  sphere(rig,0,1.78,.02,.33,.10,.225,palette.shirt);
  sphere(rig,0,1.70,.225,.20,.035,.018,palette.accent);
  // Neck, head and friendly face
  sphere(rig,0,1.99,0,.105,.13,.105,palette.skin);
  sphere(rig,0,2.22,0,.245,.285,.215,palette.skin);
  sphere(rig,0,2.34,-.055,.25,.18,.225,palette.hair);
  if (female) {
    sphere(rig,-.19,2.22,-.08,.075,.22,.12,palette.hair);
    sphere(rig,.19,2.22,-.08,.075,.22,.12,palette.hair);
    const pony=sphere(rig,.17,2.15,-.22,.12,.27,.12,palette.hair);
    pony.rotation.z=-.25;
  } else {
    sphere(rig,0,2.43,.005,.23,.075,.20,palette.hair);
  }
  sphere(rig,-.085,2.22,.194,.025,.034,.018,palette.eye);
  sphere(rig,.085,2.22,.194,.025,.034,.018,palette.eye);
  sphere(rig,0,2.12,.211,.035,.014,.012,mat('#bd7777'));
  // Arms: shoulder -> elbow -> wrist, all joints rotate from their anatomical pivot.
  for (const side of [-1,1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side*.34,1.79,0); rig.add(shoulder);
    capsule(shoulder,.43,.105,palette.shirt);
    const elbow = new THREE.Group(); elbow.position.y=-.43; shoulder.add(elbow);
    sphere(elbow,0,0,0,.078,.078,.078,palette.skin);
    capsule(elbow,.39,.067,palette.skin,.055);
    sphere(elbow,0,-.42,.015,.075,.09,.065,palette.skin);
    joints[side===-1?'leftShoulder':'rightShoulder']=shoulder;
    joints[side===-1?'leftElbow':'rightElbow']=elbow;
  }
  // Legs: articulated hips and knees with feet.
  for (const side of [-1,1]) {
    const hip = new THREE.Group(); hip.position.set(side*.15,1.0,0); rig.add(hip);
    capsule(hip,.53,.115,palette.pants,.09);
    const knee = new THREE.Group(); knee.position.y=-.53; hip.add(knee);
    sphere(knee,0,0,0,.09,.09,.09,palette.pants);
    capsule(knee,.49,.072,palette.skin,.06);
    const foot = sphere(knee,0,-.53,.075,.105,.07,.19,palette.shoe);
    joints[side===-1?'leftHip':'rightHip']=hip;
    joints[side===-1?'leftKnee':'rightKnee']=knee;
  }
  // Ground shadow
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.72,40), new THREE.MeshBasicMaterial({color:'#120e16',transparent:true,opacity:.28}));
  shadow.rotation.x=-Math.PI/2; shadow.position.y=.025; rig.add(shadow);
}
function init() {
  if (renderer || !canvas) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#211827');
  camera = new THREE.PerspectiveCamera(34,1,.1,100);
  camera.position.set(3.3,2.05,7.2); camera.lookAt(0,1.25,0);
  renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene.add(new THREE.HemisphereLight(0xffffff,0x6d4966,2.0));
  const key=new THREE.DirectionalLight(0xffffff,2.5); key.position.set(-3,5,5); scene.add(key);
  const fill=new THREE.DirectionalLight(0xff9bd0,.8); fill.position.set(4,2,-3); scene.add(fill);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(2.4,48),mat('#39283a'));
  floor.rotation.x=-Math.PI/2; floor.position.y=.015; scene.add(floor);
  makeRig(); resize();
  window.addEventListener('resize',resize);
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  lastTime=performance.now(); loop(lastTime);
}
function resize() {
  if(!renderer || !canvas.clientWidth || !canvas.clientHeight) return;
  const w=canvas.clientWidth,h=canvas.clientHeight;
  camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false);
}
function resetPose() {
  rig.position.set(0,0,0); rig.rotation.set(0,0,0);
  for(const key of Object.keys(joints)) joints[key].rotation.set(0,0,0);
}
function pose(t) {
  resetPose();
  const wave=(Math.sin(t*2.15)+1)/2;
  const pulse=(Math.sin(t*2.0)+1)/2;
  const L=joints.leftShoulder,R=joints.rightShoulder;
  const LE=joints.leftElbow,RE=joints.rightElbow;
  const LH=joints.leftHip,RH=joints.rightHip;
  const LK=joints.leftKnee,RK=joints.rightKnee;
  if(currentMove==='squat') {
    const bend=Math.max(0,Math.sin(t*1.65))*.62;
    rig.position.y=-bend*.12; rig.rotation.x=bend*.035;
    LK.rotation.x=-bend*.82; RK.rotation.x=-bend*.82;
    LH.rotation.x=bend*.30; RH.rotation.x=bend*.30;
    L.rotation.x=-.12; R.rotation.x=-.12;
  } else if(currentMove==='curl') {
    const curl=wave*.95;
    LE.rotation.x=-curl; RE.rotation.x=-curl;
    L.rotation.x=.08; R.rotation.x=.08;
  } else if(currentMove==='lunge') {
    const step=Math.max(0,Math.sin(t*1.5));
    LH.rotation.x=.35*step; RH.rotation.x=-.15*step;
    LK.rotation.x=-.72*step; RK.rotation.x=-.12*step;
    rig.position.y=-.10*step;
    L.rotation.x=-.18; R.rotation.x=-.18;
  } else if(currentMove==='raise') {
    L.rotation.z=-pulse*.95; R.rotation.z=pulse*.95;
  } else if(currentMove==='pushup') {
    rig.rotation.x=-.78;
    LH.rotation.x=.78; RH.rotation.x=.78;
    LK.rotation.x=-.12; RK.rotation.x=-.12;
    L.rotation.x=-.95; R.rotation.x=-.95;
    LE.rotation.x=-.35; RE.rotation.x=-.35;
  } else if(currentMove==='bridge') {
    rig.position.y=Math.max(0,Math.sin(t*1.5))*.24;
    LH.rotation.x=-.55; RH.rotation.x=-.55;
    LK.rotation.x=.95; RK.rotation.x=.95;
  } else {
    L.rotation.z=Math.sin(t*1.7)*.12;
    R.rotation.z=-Math.sin(t*1.7)*.12;
    rig.position.y=Math.sin(t*2)*.025;
  }
}
function loop(now) {
  raf=requestAnimationFrame(loop);
  const dt=Math.min((now-lastTime)/1000,.05); lastTime=now;
  if(!paused) elapsed += dt*speed;
  if(rig) { pose(elapsed); rig.rotation.y=Math.sin(elapsed*.45)*.07; }
  renderer.render(scene,camera);
}
function moveFor(name='') {
  const n=name.toLowerCase();
  if(/sentadilla|squat/.test(n)) return 'squat';
  if(/curl|bíceps|biceps|remo/.test(n)) return 'curl';
  if(/zancada|desplante|lunge|step-up/.test(n)) return 'lunge';
  if(/flexion|flexión|push.?up|fondos/.test(n)) return 'pushup';
  if(/puente de glúteos|puente gluteos/.test(n)) return 'bridge';
  if(/press|elevación|elevacion|círculos|circulos|ángeles|angeles/.test(n)) return 'raise';
  return 'gentle';
}
function updatePauseButton() {
  const b=$('#trainerPause');
  if(b) b.textContent=paused?'▶ Reanudar':'Ⅱ Pausar';
}
function openDemo(name='Movimiento', detail='Sigue el movimiento con calma y dentro de un rango cómodo.') {
  currentMove=moveFor(name);
  $('#trainerExerciseName').textContent=name;
  $('#trainerExerciseTip').textContent=detail;
  $('#trainerMotionLabel').textContent=({
    squat:'Flexiona caderas y rodillas y vuelve a subir',
    curl:'Flexiona los codos manteniéndolos cerca del cuerpo',
    lunge:'Alterna el paso y flexiona ambas rodillas',
    raise:'Eleva los brazos hacia los lados y baja con control',
    pushup:'Flexiona y extiende los codos manteniendo el tronco alineado',
    bridge:'Eleva y baja la pelvis de forma controlada',
    gentle:'Movimiento suave y controlado'
  })[currentMove];
  if(!dialog.open) dialog.showModal();
  init(); elapsed=0; paused=false; updatePauseButton(); resize();
}
function setTrainer(which) {
  selected=which; localStorage.setItem('zulyfit-trainer',which);
  if(renderer && rig) { scene.remove(rig); makeRig(); }
  document.querySelectorAll('[data-trainer-choice]').forEach(b=>b.classList.toggle('selected',b.dataset.trainerChoice===which));
}
document.addEventListener('click',e=>{
  const demo=e.target.closest('[data-demo-exercise]');
  if(demo) { e.preventDefault(); openDemo(demo.dataset.demoExercise,demo.dataset.demoTip||'Mantén una postura cómoda y controla cada repetición.'); }
  const choice=e.target.closest('[data-trainer-choice]');
  if(choice) setTrainer(choice.dataset.trainerChoice);
});
$('#trainerClose')?.addEventListener('click',()=>dialog.close());
$('#trainerPause')?.addEventListener('click',()=>{paused=!paused;updatePauseButton();});
$('#trainerRestart')?.addEventListener('click',()=>{elapsed=0;paused=false;updatePauseButton();});
$('#trainerSpeed')?.addEventListener('change',e=>{speed=Number(e.target.value)||1;});
dialog.addEventListener('close',()=>{paused=true;});
setTrainer(selected);
