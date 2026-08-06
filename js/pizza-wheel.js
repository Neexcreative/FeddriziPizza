const IMG = {
  pepperoni: 'assets/images/pizzas/pepperoni.webp',
  'veggie-supreme': 'assets/images/pizzas/veggie-supreme.webp',
  'mushroom-ham': 'assets/images/pizzas/mushroom-ham.webp',
  mediterranean: 'assets/images/pizzas/mediterranean.webp',
  hawaiian: 'assets/images/pizzas/hawaiian.webp',
  'greek-supreme': 'assets/images/pizzas/greek-supreme.webp',
  'ham-onion': 'assets/images/pizzas/ham-onion.webp',
  'italian-supreme': 'assets/images/pizzas/italian-supreme.webp'
};

const PHOTO_SIZES = {
  pepperoni: [602, 509],
  'veggie-supreme': [510, 448],
  'mushroom-ham': [380, 504],
  mediterranean: [463, 509],
  hawaiian: [554, 375],
  'greek-supreme': [503, 500],
  'ham-onion': [351, 530],
  'italian-supreme': [467, 503]
};

const PHOTO_ROTATION = {
  pepperoni: 90,
  'veggie-supreme': -45,
  'mushroom-ham': 0,
  mediterranean: -135,
  hawaiian: -90,
  'greek-supreme': 135,
  'ham-onion': 180,
  'italian-supreme': 45
};

export const flavors = [
  {name:'Pepperoni',ing:'Mozzarella, spicy pepperoni, tomato base',tags:['Gluten','Dairy'],img:'pepperoni'},
  {name:'Veggie Supreme',ing:'Cherry tomato, peppers, mozzarella, garden veg',tags:['Vegetarian','Gluten','Dairy'],img:'veggie-supreme'},
  {name:'Mushroom & Ham',ing:'Mushrooms, ham, mozzarella',tags:['Gluten','Dairy'],img:'mushroom-ham'},
  {name:'Mediterranean',ing:'Green olives, green pepper, mozzarella, basil',tags:['Vegetarian','Gluten','Dairy'],img:'mediterranean'},
  {name:'Hawaiian',ing:'Ham, pineapple, mozzarella',tags:['Gluten','Dairy'],img:'hawaiian'},
  {name:'Greek Supreme',ing:'Black olives, peppers, tomato, feta',tags:['Vegetarian','Gluten','Dairy'],img:'greek-supreme'},
  {name:'Ham & Onion',ing:'Caramelised onion, ham, mozzarella, white base',tags:['Gluten','Dairy'],img:'ham-onion'},
  {name:'Italian Supreme',ing:'Black olives, salami, tomato, mozzarella',tags:['Gluten','Dairy'],img:'italian-supreme'}
];

export const sizes = [
  {k:'Small',slices:4,price:18},
  {k:'Medium',slices:8,price:22},
  {k:'Large',slices:12,price:28}
];

const N=flavors.length;
const SLICE=360/N;
const CX=450;
const CY=450;
const R=430;
const HALF=21*Math.PI/180;
const D2R=Math.PI/180;

const norm=i=>((i%N)+N)%N;
const money=n=>`€${n.toFixed(2)}`;

function upWedge(){
  const p0x=(CX+R*Math.sin(-HALF)).toFixed(1);
  const p0y=(CY-R*Math.cos(-HALF)).toFixed(1);
  const p1x=(CX+R*Math.sin(HALF)).toFixed(1);
  const p1y=(CY-R*Math.cos(HALF)).toFixed(1);
  return `M${CX},${CY} L${p0x},${p0y} A${R},${R} 0 0 1 ${p1x},${p1y} Z`;
}

function renderWheel(){
  let markup=`<clipPath id="wedgeClip" clipPathUnits="userSpaceOnUse"><path d="${upWedge()}"/></clipPath>`;
  flavors.forEach((flavor,i)=>{
    const angle=i*SLICE;
    const [sourceWidth,sourceHeight]=PHOTO_SIZES[flavor.img];
    const photoRotation=PHOTO_ROTATION[flavor.img];
    const radians=Math.abs(photoRotation)*D2R;
    const rotatedHeight=Math.abs(sourceWidth*Math.sin(radians))+Math.abs(sourceHeight*Math.cos(radians));
    const scale=(R*1.04)/rotatedHeight;
    const width=sourceWidth*scale;
    const height=sourceHeight*scale;
    const photoX=CX-width/2;
    const photoY=CY-R/2-height/2;
    markup+=`<g class="slice" data-i="${i}"><g transform="rotate(${angle} ${CX} ${CY})">`+
      `<g clip-path="url(#wedgeClip)"><image href="${IMG[flavor.img]}" x="${photoX.toFixed(1)}" y="${photoY.toFixed(1)}" width="${width.toFixed(1)}" height="${height.toFixed(1)}" preserveAspectRatio="xMidYMid meet" transform="rotate(${photoRotation} ${CX} ${CY-R/2})"/></g>`+
      '</g></g>';
  });
  document.getElementById('wheel').innerHTML=markup;
}

export function createPizzaWheel(){
  renderWheel();

  let index=0;
  let rotation=0;
  let size=1;
  let drag=false;
  let startX=0;
  let startRotation=0;

  const wheel=document.getElementById('wheel');
  const wrap=document.querySelector('.pizza-wrap');
  const sliceElements=[...document.querySelectorAll('.slice')];
  const flavorName=document.getElementById('fName');
  const flavorDescription=document.getElementById('fDesc');
  const previousLabel=document.getElementById('lblPrev');
  const nextLabel=document.getElementById('lblNext');
  const sizeRail=document.getElementById('sizeRail');
  const mobileSizes=document.getElementById('mobileSizes');

  function liftActive(){
    sliceElements.forEach(element=>element.style.transform='');
    const angle=index*SLICE;
    const lift=30;
    const dx=lift*Math.sin(angle*D2R);
    const dy=-lift*Math.cos(angle*D2R);
    sliceElements[index].style.transform=`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
  }

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

  function goTo(nextIndex,animate=true){
    index=norm(nextIndex);
    rotation=-index*SLICE;
    if(!animate)wheel.style.transition='none';
    wheel.style.transform=`rotate(${rotation}deg)`;
    if(!animate)requestAnimationFrame(()=>wheel.style.transition='');
    updateReadout();
    liftActive();
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

  function updateSelectedPrice(){document.getElementById('selectedPrice').textContent=money(sizes[size].price)}

  document.getElementById('next').onclick=()=>goTo(index+1);
  document.getElementById('prev').onclick=()=>goTo(index-1);
  addEventListener('keydown',event=>{
    if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
    const target=event.target instanceof Element?event.target:null;
    const isEditing=target?.closest('input, textarea, select, [contenteditable], form');
    const dialogOpen=document.querySelector('[role="dialog"].show');
    if(isEditing||dialogOpen)return;
    goTo(index+(event.key==='ArrowRight'?1:-1));
  });

  const pointerDown=x=>{drag=true;startX=x;startRotation=rotation;document.body.classList.add('dragging');sliceElements.forEach(element=>element.style.transform='')};
  const pointerMove=x=>{if(!drag)return;rotation=startRotation+(x-startX)*0.32;wheel.style.transform=`rotate(${rotation}deg)`};
  const pointerUp=()=>{if(!drag)return;drag=false;document.body.classList.remove('dragging');goTo(Math.round(-rotation/SLICE))};
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
    getIndex(){return index}
  };
}
