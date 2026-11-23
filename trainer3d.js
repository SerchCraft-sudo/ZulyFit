import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = (s, root=document) => root.querySelector(s);
const saved = localStorage.getItem('zulyfit-trainer') || 'female';
let selected = saved, scene, camera, renderer, rig, animationId, currentMove='squat', startTime=0, armLeft, armRight;
const canvas = $('#trainerCanvas');
const dialog = $('#trainerDialog');
const material = (color, roughness=.72) => new THREE.MeshStandardMaterial({color, roughness});
const mats = {
  skin: material('#f2c4a7'), hair: material('#39252c'), shirt: material('#201c27'), pants: material('#24212d'), accent: material('#f04491'), shoe: material('#f7f1f5'), eye: material('#30212a'), white: material('#ffffff')
};
function sphere(parent, x,y,z, sx,sy,sz, mat){const m=new THREE.Mesh(new THREE.SphereGeometry(1,24,18),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m}
function limb(parent, a,b,r1,r2,mat){const v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b),d=new THREE.Vector3().subVectors(v2,v1);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),16),mat);mesh.position.copy(v1).add(v2).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(mesh);sphere(parent,...a,r1,r1,r1,mat);sphere(parent,...b,r2,r2,r2,mat);return mesh}
function makeRig(){
  rig=new THREE.Group();scene.add(rig);
  const female=selected==='female';
  const skin=mats.skin, top=mats.shirt, bottom=mats.pants;
  // torso, hips and head
  sphere(rig,0,1.55,0,.36,.48,.22,top);sphere(rig,0,1.16,0,.32,.22,.2,bottom);
  limb(rig,[-.13,1.14,0],[-.16,.48,0],.105,.075,bottom);limb(rig,[.13,1.14,0],[.16,.48,0],.105,.075,bottom);
  sphere(rig,-.16,.38,.04,.13,.09,.2,mats.shoe);sphere(rig,.16,.38,.04,.13,.09,.2,mats.shoe);
  armLeft=limb(rig,[-.32,1.82,0],[-.48,1.35,0],.105,.075,top);armRight=limb(rig,[.32,1.82,0],[.48,1.35,0],.105,.075,top);
  sphere(rig,-.48,1.32,0,.09,.1,.09,skin);sphere(rig,.48,1.32,0,.09,.1,.09,skin);
  limb(rig,[-.48,1.32,0],[-.42,.98,.04],.07,.055,skin);limb(rig,[.48,1.32,0],[.42,.98,.04],.07,.055,skin);
  sphere(rig,0,2.18,0,.25,.29,.23,skin);
  sphere(rig,0,2.34,-.055,.255,.19,.23,mats.hair);
  if(female){const pony=sphere(rig,.17,2.22,-.19,.13,.28,.12,mats.hair);pony.rotation.z=-.25;} else {sphere(rig,0,2.42,0,.24,.09,.22,mats.hair)}
  sphere(rig,-.09,2.19,.205,.025,.035,.018,mats.eye);sphere(rig,.09,2.19,.205,.025,.035,.018,mats.eye);
  sphere(rig,0,2.1,.213,.045,.018,.012,material('#c97879'));
  // bright sporty trim
  sphere(rig,0,1.72,.218,.19,.045,.018,mats.accent);
  return rig;
}
function setup(){
  if(!canvas || renderer)return;
  scene=new THREE.Scene();scene.background=new THREE.Color('#211827');
  camera=new THREE.PerspectiveCamera(34,canvas.clientWidth/canvas.clientHeight,.1,100);camera.position.set(0,1.65,7.4);camera.lookAt(0,1.3,0);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene.add(new THREE.HemisphereLight(0xffffff,0x6d4966,2));const light=new THREE.DirectionalLight(0xffffff,2.4);light.position.set(-3,5,5);scene.add(light);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(2.4,48),material('#39283a'));floor.rotation.x=-Math.PI/2;floor.position.y=.12;scene.add(floor);
  makeRig();window.addEventListener('resize',resize);animate();
}
function resize(){if(!renderer)return;const w=canvas.clientWidth,h=canvas.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
function animate(){animationId=requestAnimationFrame(animate);const t=(performance.now()-startTime)/1000; if(rig){rig.position.y=0;rig.rotation.y=Math.sin(t*.55)*.08;const phase=(t%3)/3;const wave=Math.sin(phase*Math.PI*2);
  // readable, gentle looping demonstrations; all motions are illustrative.
  if(currentMove==='squat'){const bend=Math.max(0,wave)*.48;rig.position.y=-bend*.25;rig.rotation.x=bend*.18;}
  else if(currentMove==='curl'){const lift=(Math.sin(t*2.1)+1)/2;rig.rotation.z=0;}
  else if(currentMove==='lunge'){rig.position.y=-Math.max(0,wave)*.12;rig.rotation.x=Math.max(0,wave)*.16;}
  else if(currentMove==='raise'){rig.rotation.z=Math.sin(t*2)*.12;}
  else {rig.position.y=Math.sin(t*2)*.035;}
  if(armLeft&&armRight){const pulse=(Math.sin(t*2.1)+1)/2;armLeft.rotation.z=currentMove==='curl'?-.12-pulse*.55:currentMove==='raise'?.1+pulse*.55:Math.sin(t*1.5)*.035;armRight.rotation.z=currentMove==='curl'?.12+pulse*.55:currentMove==='raise'?-.1-pulse*.55:-Math.sin(t*1.5)*.035;}
  }renderer.render(scene,camera)}
function moveFor(name=''){const n=name.toLowerCase();if(/sentadilla|squat/.test(n))return'squat';if(/curl|bíceps|biceps|remo/.test(n))return'curl';if(/zancada|desplante|lunge|step-up/.test(n))return'lunge';if(/press|elevación|elevacion|círculos|circulos|ángeles|angeles/.test(n))return'raise';return'gentle'}
function openDemo(name='Movimiento', detail='Sigue el movimiento con calma y dentro de un rango cómodo.'){currentMove=moveFor(name);$('#trainerExerciseName').textContent=name;$('#trainerExerciseTip').textContent=detail;$('#trainerMotionLabel').textContent=({squat:'Flexiona y vuelve a subir',curl:'Flexiona los codos con control',lunge:'Da el paso y regresa',raise:'Eleva y baja suavemente',gentle:'Movimiento controlado'})[currentMove];if(!dialog.open)dialog.showModal();setup();startTime=performance.now();resize()}
function setTrainer(which){selected=which;localStorage.setItem('zulyfit-trainer',which);if(renderer){scene.remove(rig);makeRig();}document.querySelectorAll('[data-trainer-choice]').forEach(b=>b.classList.toggle('selected',b.dataset.trainerChoice===which));}
document.addEventListener('click',e=>{const demo=e.target.closest('[data-demo-exercise]');if(demo){e.preventDefault();openDemo(demo.dataset.demoExercise,demo.dataset.demoTip||'Mantén una postura cómoda y controla cada repetición.')}const choice=e.target.closest('[data-trainer-choice]');if(choice)setTrainer(choice.dataset.trainerChoice);});
$('#trainerClose')?.addEventListener('click',()=>dialog.close());
setTrainer(saved);
