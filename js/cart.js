const CART_KEY='forno-cart-v1';

const sides={
  Drinks:[['Coca-Cola 330ml',3],['Sparkling Water',2.5],['Peroni 330ml',5]],
  Dips:[['Garlic & Herb',1.5],['Spicy Nduja',2],['Blue Cheese',1.5]],
  Fries:[['Rosemary Fries',4.5],['Truffle Fries',6],['Loaded Fries',7]]
};

export const formatMoney=value=>`€${value.toFixed(2)}`;

export function createCart({pizzaWheel,modal,burst=()=>{}}){
  let items=[];
  let toastTimer;
  const cartItems=document.getElementById('cartItems');

  try{items=JSON.parse(localStorage.getItem(CART_KEY))||[]}
  catch{items=[]}

  const sum=()=>items.reduce((total,item)=>total+item.price*(item.qty||1),0);
  const save=()=>localStorage.setItem(CART_KEY,JSON.stringify(items));

  function notify(message){
    const toast=document.getElementById('toast');
    toast.textContent=message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.classList.remove('show'),2200);
  }

  function render(){
    const total=sum();
    document.getElementById('cartTotal').textContent=formatMoney(total);
    document.getElementById('ddTotal').textContent=formatMoney(total);
    if(!items.length)cartItems.innerHTML='<div class="cart-empty">Your order is empty</div>';
    else cartItems.innerHTML=items.map((item,index)=>`<div class="ci"><div><div class="ci-n">${item.name}</div><div class="ci-s">${item.size||''}</div></div><div style="display:flex;align-items:center;gap:9px"><div class="qty" aria-label="Quantity"><button data-qty="${index}|-1" aria-label="Decrease ${item.name}">−</button><span>${item.qty||1}</span><button data-qty="${index}|1" aria-label="Increase ${item.name}">+</button></div><span class="ci-p">${formatMoney(item.price*(item.qty||1))}</span><button class="rm" data-rm="${index}" aria-label="Remove ${item.name}">×</button></div></div>`).join('');
    document.getElementById('goCart').disabled=!items.length;
    save();
  }

  function addPizza(){
    const {flavor,size}=pizzaWheel.getSelection();
    const label=`${size.k} · ${size.slices} slices`;
    const existing=items.find(item=>item.name===flavor.name&&item.size===label);
    if(existing)existing.qty=(existing.qty||1)+1;
    else items.push({name:flavor.name,size:label,price:size.price,qty:1});
    render();
    burst();
    notify(`${flavor.name} added to your order`);
    const cartButton=document.getElementById('cartBtn');
    cartButton.classList.add('bump');
    setTimeout(()=>cartButton.classList.remove('bump'),360);
  }

  function addSide(name,price){
    const existing=items.find(item=>item.name===name&&item.size==='Side');
    if(existing)existing.qty=(existing.qty||1)+1;
    else items.push({name,size:'Side',price,qty:1});
    render();
    burst();
    notify(`${name} added to your order`);
  }

  document.getElementById('addPizza').onclick=addPizza;
  cartItems.addEventListener('click',event=>{
    const removeIndex=event.target.dataset.rm;
    const quantityChange=event.target.dataset.qty;
    if(removeIndex!=null){items.splice(+removeIndex,1);render();return}
    if(quantityChange){
      const [index,delta]=quantityChange.split('|').map(Number);
      items[index].qty=(items[index].qty||1)+delta;
      if(items[index].qty<1)items.splice(index,1);
      render();
    }
  });

  document.querySelectorAll('[data-cat]').forEach(button=>button.onclick=()=>{
    const category=button.dataset.cat;
    document.getElementById('sidesTitle').textContent=category;
    document.getElementById('sidesList').innerHTML=sides[category].map(([name,price])=>`<div class="sr"><span>${name} <span style="opacity:.6">· ${formatMoney(price)}</span></span><button data-add="${name}|${price}">+</button></div>`).join('');
    modal.open(document.getElementById('sidesModal'));
  });

  document.getElementById('sidesList').addEventListener('click',event=>{
    const data=event.target.dataset.add;
    if(!data)return;
    const [name,price]=data.split('|');
    addSide(name,+price);
  });

  render();

  return {
    getItems(){return items},
    sum,
    render,
    clear(){items=[];render()},
    addPizza
  };
}
