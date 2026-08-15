import {FLAVORS as flavors, SIZES as sizes} from './site-config.js';

const N=flavors.length;
const SLICE=360/N;
const BASE_ROTATION_OFFSET=22.5;
const WHEEL_IMAGE_SRC='assets/images/pizzas/FULL_PIZZA.webp';
const WEDGE_RADIUS_PERCENT=52;
const WEDGE_OVERLAP_DEG=0.6;
const WEDGE_ARC_STEPS=10;
const WEDGE_LIFT_PERCENT=6;

const norm=i=>((i%N)+N)%N;

// Builds N wedge layers, each showing the same shared image clipped to its own
// slice, so a single slice can hover/lift independently without needing 8
// separate photos. The whole group still rotates as one unit (see setRotation),
// so index/flavour logic is untouched - this only adds a hover layer on top.
function buildWheelWedges(container){
  container.innerHTML='';
  for(let i=0;i<N;i++){
    // local (unrotated) angle where this wedge sits so that, once the group is
    // rotated to show index i (rotation = BASE_ROTATION_OFFSET - i*SLICE), the
    // wedge lands at the top (0deg, 12 o'clock): local + rotation = 0.
    const centerAngle=i*SLICE-BASE_ROTATION_OFFSET;
    const startAngle=centerAngle-SLICE/2-WEDGE_OVERLAP_DEG;
    const endAngle=centerAngle+SLICE/2+WEDGE_OVERLAP_DEG;
    const points=['50% 50%'];
    for(let step=0;step<=WEDGE_ARC_STEPS;step++){
      const angle=startAngle+(endAngle-startAngle)*(step/WEDGE_ARC_STEPS);
      const rad=angle*Math.PI/180;
      const x=50+WEDGE_RADIUS_PERCENT*Math.sin(rad);
      const y=50-WEDGE_RADIUS_PERCENT*Math.cos(rad);
      points.push(`${x.toFixed(3)}% ${y.toFixed(3)}%`);
    }
    const centerRad=centerAngle*Math.PI/180;
    const dx=Math.sin(centerRad)*WEDGE_LIFT_PERCENT;
    const dy=-Math.cos(centerRad)*WEDGE_LIFT_PERCENT;

    const wedge=document.createElement('div');
    wedge.className='wedge';
    wedge.style.clipPath=`polygon(${points.join(',')})`;
    wedge.style.setProperty('--wedge-dx',`${dx.toFixed(2)}%`);
    wedge.style.setProperty('--wedge-dy',`${dy.toFixed(2)}%`);

    const img=document.createElement('img');
    img.src=WHEEL_IMAGE_SRC;
    img.alt='';
    img.draggable=false;
    wedge.appendChild(img);
    container.appendChild(wedge);
  }
}

const hasGsap=typeof gsap!=='undefined';
if(hasGsap&&typeof InertiaPlugin!=='undefined')gsap.registerPlugin(InertiaPlugin);
document.documentElement.classList.toggle('no-gsap',!hasGsap);

export function createPizzaWheel(){
  let index=0;
  let continuousStep=0;
  let visualRotation=BASE_ROTATION_OFFSET;
  let size=1;
  let drag=false;
  let startX=0;
  let startRotation=0;
  let settleTween=null;
  let swapTimeline=null;

  const wheel=document.getElementById('pizza-wheel');
  const wrap=document.querySelector('.pizza-wrap');
  const flavorName=document.getElementById('fName');
  const flavorDescription=document.getElementById('fDesc');
  const previousLabel=document.getElementById('lblPrev');
  const nextLabel=document.getElementById('lblNext');
  const sizeRail=document.getElementById('sizeRail');
  const mobileSizes=document.getElementById('mobileSizes');

  buildWheelWedges(wheel);
  if(hasGsap&&typeof InertiaPlugin!=='undefined')InertiaPlugin.track(wheel,'rotation');

  function updateReadout(){
    const flavor=flavors[index];
    const applyContent=()=>{
      flavorName.textContent=flavor.name;
      flavorDescription.innerHTML=`<span>${flavor.ing}</span>`+flavor.tags.map(tag=>`<span class="tag ${tag==='Vegetarian'?'v':''}">${tag}</span>`).join('');
    };
    if(hasGsap){
      swapTimeline?.kill();
      swapTimeline=gsap.timeline()
        .to([flavorName,flavorDescription],{opacity:0,y:14,filter:'blur(6px)',duration:.18,ease:'power2.in'})
        .call(applyContent)
        .set([flavorName,flavorDescription],{filter:'blur(0px)'})
        .to([flavorName,flavorDescription],{opacity:1,y:0,duration:.32,ease:'power2.out'});
    }else{
      flavorName.classList.add('swap');
      flavorDescription.classList.add('swap');
      setTimeout(()=>{
        applyContent();
        flavorName.classList.remove('swap');
        flavorDescription.classList.remove('swap');
      },180);
    }
    previousLabel.textContent=flavors[norm(index-1)].name;
    nextLabel.textContent=flavors[norm(index+1)].name;
  }

  function setRotation(rotation,animate){
    settleTween?.kill();
    visualRotation=rotation;
    if(!hasGsap){
      wheel.style.transition=animate?'':'none';
      wheel.style.transform=`rotate(${rotation}deg)`;
      if(!animate)requestAnimationFrame(()=>wheel.style.transition='');
      return;
    }
    if(animate)settleTween=gsap.to(wheel,{rotation,duration:.62,ease:'power3.out'});
    else gsap.set(wheel,{rotation});
  }

  function goTo(nextStep,animate=true){
    continuousStep=nextStep;
    index=norm(continuousStep);
    setRotation(BASE_ROTATION_OFFSET-continuousStep*SLICE,animate);
    updateReadout();
  }

  function buildSizes(container,compact){
    container.innerHTML='';
    sizes.forEach((option,i)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className=`pill size${i===size?' on':''}`;
      button.innerHTML=compact
        ? `<span>${option.k}</span><span class="p-price">€${option.price}</span>`
        : `<span class="p-name"><span>${option.k}</span><span class="p-sub">${option.slices} slices</span></span><span class="p-price">€${option.price}</span>`;
      button.setAttribute('aria-pressed',String(i===size));
      button.onclick=()=>{size=i;buildSizes(sizeRail,false);buildSizes(mobileSizes,true);updateSelectedPrice()};
      container.appendChild(button);
    });
  }

  function updateSelectedPrice(){document.getElementById('selectedPrice').textContent=`€${sizes[size].price}`}

  document.getElementById('next').onclick=()=>goTo(continuousStep+1);
  document.getElementById('prev').onclick=()=>goTo(continuousStep-1);
  addEventListener('keydown',event=>{
    if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
    const target=event.target instanceof Element?event.target:null;
    const isEditing=target?.closest('input, textarea, select, [contenteditable], form');
    const dialogOpen=document.querySelector('[role="dialog"].show');
    if(isEditing||dialogOpen)return;
    goTo(continuousStep+(event.key==='ArrowRight'?1:-1));
  });

  const pointerDown=x=>{
    settleTween?.kill();
    drag=true;
    startX=x;
    startRotation=visualRotation;
    document.body.classList.add('dragging');
  };
  const pointerMove=x=>{
    if(!drag)return;
    visualRotation=startRotation+(x-startX)*0.32;
    if(hasGsap)gsap.set(wheel,{rotation:visualRotation});
    else wheel.style.transform=`rotate(${visualRotation}deg)`;
  };
  const pointerUp=()=>{
    if(!drag)return;
    drag=false;
    document.body.classList.remove('dragging');
    if(!hasGsap||typeof InertiaPlugin==='undefined'){
      goTo(Math.round((BASE_ROTATION_OFFSET-visualRotation)/SLICE));
      return;
    }
    const snap=value=>BASE_ROTATION_OFFSET-Math.round((BASE_ROTATION_OFFSET-value)/SLICE)*SLICE;
    settleTween=gsap.to(wheel,{
      inertia:{rotation:{velocity:'auto',end:snap}},
      onUpdate(){visualRotation=gsap.getProperty(wheel,'rotation')},
      onComplete(){
        continuousStep=Math.round((BASE_ROTATION_OFFSET-visualRotation)/SLICE);
        index=norm(continuousStep);
        updateReadout();
      }
    });
  };
  wrap.addEventListener('pointerdown',event=>pointerDown(event.clientX));
  addEventListener('pointermove',event=>pointerMove(event.clientX));
  addEventListener('pointerup',pointerUp);
  addEventListener('pointercancel',pointerUp);

  buildSizes(sizeRail,false);
  buildSizes(mobileSizes,true);
  goTo(0,false);
  updateSelectedPrice();

  return {
    getSelection(){return {flavor:flavors[index],size:sizes[size]}},
    goTo,
    getIndex(){return index},
    getContinuousStep(){return continuousStep}
  };
}
