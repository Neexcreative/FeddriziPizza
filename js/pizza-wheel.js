export const flavors = [
  {name:'Pepperoni',ing:'Mozzarella, spicy pepperoni, tomato base',tags:['Gluten','Dairy']},
  {name:'Veggie Supreme',ing:'Cherry tomato, peppers, mozzarella, garden veg',tags:['Vegetarian','Gluten','Dairy']},
  {name:'Mushroom & Ham',ing:'Mushrooms, ham, mozzarella',tags:['Gluten','Dairy']},
  {name:'Mediterranean',ing:'Green olives, green pepper, mozzarella, basil',tags:['Vegetarian','Gluten','Dairy']},
  {name:'Hawaiian',ing:'Ham, pineapple, mozzarella',tags:['Gluten','Dairy']},
  {name:'Greek Supreme',ing:'Black olives, peppers, tomato, feta',tags:['Vegetarian','Gluten','Dairy']},
  {name:'Ham & Onion',ing:'Caramelised onion, ham, mozzarella, white base',tags:['Gluten','Dairy']},
  {name:'Italian Supreme',ing:'Black olives, salami, tomato, mozzarella',tags:['Gluten','Dairy']}
];

export const sizes = [
  {k:'Small',slices:4,price:18},
  {k:'Medium',slices:8,price:22},
  {k:'Large',slices:12,price:28}
];

const N=flavors.length;
const SLICE=360/N;
const BASE_ROTATION_OFFSET=22.5;

const norm=i=>((i%N)+N)%N;

export function createPizzaWheel(){
  let index=0;
  let continuousStep=0;
  let visualRotation=BASE_ROTATION_OFFSET;
  let size=1;
  let drag=false;
  let startX=0;
  let startVisualRotation=0;

  const wheel=document.getElementById('pizzaWheel');
  const wrap=document.querySelector('.pizza-wrap');
  const flavorName=document.getElementById('fName');
  const flavorDescription=document.getElementById('fDesc');
  const previousLabel=document.getElementById('lblPrev');
  const nextLabel=document.getElementById('lblNext');
  const sizeRail=document.getElementById('sizeRail');
  const mobileSizes=document.getElementById('mobileSizes');

  function updateReadout(){
    const flavor=flavors[index];
    flavorName.classList.add('swap');
    flavorDescription.classList.add('swap');
    setTimeout(()=>{
      flavorName.textContent=flavor.name;
      flavorDescription.innerHTML=`<span>${flavor.ing}</span>`+flavor.tags.map(tag=>`<span class="tag ${tag==='Vegetarian'?'v':''}">${tag}</span>`).join('');
      flavorName.classList.remove('swap');
      flavorDescription.classList.remove('swap');
    },180);
    previousLabel.textContent=flavors[norm(index-1)].name;
    nextLabel.textContent=flavors[norm(index+1)].name;
  }

  function goTo(nextStep,animate=true){
    continuousStep=nextStep;
    index=norm(continuousStep);
    visualRotation=BASE_ROTATION_OFFSET-continuousStep*SLICE;
    if(!animate)wheel.style.transition='none';
    wheel.style.transform=`rotate(${visualRotation}deg)`;
    if(!animate)requestAnimationFrame(()=>wheel.style.transition='');
    updateReadout();
  }

  function buildSizes(container,compact){
    container.innerHTML='';
    sizes.forEach((option,i)=>{
      const button=document.createElement('button');
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

  const pointerDown=x=>{drag=true;startX=x;startVisualRotation=visualRotation;document.body.classList.add('dragging')};
  const pointerMove=x=>{if(!drag)return;visualRotation=startVisualRotation+(x-startX)*0.32;wheel.style.transform=`rotate(${visualRotation}deg)`};
  const pointerUp=()=>{if(!drag)return;drag=false;document.body.classList.remove('dragging');goTo(Math.round((BASE_ROTATION_OFFSET-visualRotation)/SLICE))};
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
