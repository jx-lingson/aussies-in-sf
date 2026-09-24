'use client';
import {useEffect,useRef,useState} from 'react';

export default function KangarooLogo(){
 const host=useRef<HTMLDivElement>(null),paused=useRef(false),spin=useRef<(()=>void)|null>(null);
 const [stopped,setStopped]=useState(false),[loaded,setLoaded]=useState(false);
 useEffect(()=>{
  let disposed=false,cleanup=()=>{};
  async function mount(){
   try{
    const THREE=await import('three');
    const {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js');
    if(disposed||!host.current)return;
    const element=host.current;
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
    renderer.setSize(64,68);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.domElement.style.opacity="0";element.appendChild(renderer.domElement);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(35,64/68,.1,100);camera.position.set(0,.2,5.3);
    scene.add(new THREE.HemisphereLight(0xfff3d6,0x60451e,2.8));
    const light=new THREE.DirectionalLight(0xffffff,3.4);light.position.set(3,4,5);scene.add(light);
    const rim=new THREE.DirectionalLight(0xffd88a,2);rim.position.set(-3,1,-2);scene.add(rim);
    const group=new THREE.Group();scene.add(group);
    let frame=0,dragging=false,lastX=0,lastTime=0,boost=0;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    paused.current=reduced.matches;setStopped(reduced.matches);
    const onMotion=()=>{paused.current=reduced.matches;setStopped(reduced.matches)};
    reduced.addEventListener('change',onMotion);
    const down=(e:PointerEvent)=>{dragging=true;lastX=e.clientX;element.setPointerCapture(e.pointerId)};
    const move=(e:PointerEvent)=>{if(dragging){group.rotation.y+=(e.clientX-lastX)*.035;lastX=e.clientX}};
    const up=()=>{dragging=false};
    element.addEventListener('pointerdown',down);element.addEventListener('pointermove',move);element.addEventListener('pointerup',up);element.addEventListener('pointercancel',up);
    spin.current=()=>{boost=Math.PI*2};
    const disposeModel=(root:any)=>root.traverse((node:any)=>{node.geometry?.dispose();if(node.material){for(const m of [node.material].flat()){for(const v of Object.values(m))if((v as any)?.isTexture)(v as any).dispose();m.dispose()}}});
    cleanup=()=>{cancelAnimationFrame(frame);reduced.removeEventListener('change',onMotion);element.removeEventListener('pointerdown',down);element.removeEventListener('pointermove',move);element.removeEventListener('pointerup',up);element.removeEventListener('pointercancel',up);disposeModel(group);renderer.dispose();renderer.domElement.remove();spin.current=null};
    new GLTFLoader().load('/kangaroo.glb',gltf=>{
     if(disposed){disposeModel(gltf.scene);return}
     const box=new THREE.Box3().setFromObject(gltf.scene),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
     const model=gltf.scene;model.position.sub(center);
     const normalised=new THREE.Group();normalised.add(model);normalised.scale.setScalar(2.6/Math.max(size.x,size.y,size.z));
     model.traverse((child:any)=>{if(child.isMesh){for(const m of [child.material].flat())m.dispose();child.material=new THREE.MeshStandardMaterial({color:0xd6a83e,metalness:.62,roughness:.28,flatShading:true})}});
     group.add(normalised);group.rotation.y=-.7;group.rotation.x=.12;renderer.render(scene,camera);renderer.domElement.style.opacity="1";setLoaded(true);
    },undefined,()=>{if(!disposed)setLoaded(false)});
    function animate(t:number){if(disposed)return;const dt=Math.min((t-lastTime)/1000,.05);lastTime=t;
     if(!document.hidden&&!dragging&&!paused.current){const extra=Math.min(boost,dt*5);boost-=extra;group.rotation.y+=dt*.55+extra}
     renderer.render(scene,camera);frame=requestAnimationFrame(animate)
    }frame=requestAnimationFrame(animate);
   }catch{if(!disposed)setLoaded(false)}
  }mount();return()=>{disposed=true;cleanup()};
 },[]);
 return <div className="roo-logo"><div ref={host} className="roo-canvas" role="img" aria-label="Gold 3D kangaroo. Drag to rotate." onDoubleClick={()=>spin.current?.()}></div>{loaded&&<button className="roo-pause" title={stopped?'Spin kangaroo':'Pause kangaroo'} aria-label={stopped?'Spin kangaroo':'Pause kangaroo'} onClick={()=>{paused.current=!paused.current;setStopped(paused.current)}}>{stopped?'▷':'Ⅱ'}</button>}</div>
}
