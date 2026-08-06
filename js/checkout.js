import {formatMoney} from './cart.js';
import {DELIVERY_CONFIG} from './site-config.js';

const validators={
  firstName:value=>value.trim().length>1,
  phone:value=>value.replace(/\D/g,'').length>=7,
  email:value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  card:value=>value.replace(/\D/g,'').length===16,
  expiry:value=>/^(0[1-9]|1[0-2])\/\d{2}$/.test(value),
  cvc:value=>/^\d{3,4}$/.test(value)
};

export function initCheckout({cart,modal}){
  let mode='delivery';
  const addressInput=document.getElementById('address');
  const addressError=document.getElementById('addressError');
  const checkoutForm=document.getElementById('checkoutForm');
  document.getElementById('deliveryFeeAmount').textContent=formatMoney(DELIVERY_CONFIG.baseFee);
  document.getElementById('eta').textContent=DELIVERY_CONFIG.deliveryEta;

  function clearAddressError(){
    addressInput.removeAttribute('aria-invalid');
    addressError.textContent='';
  }

  function validateAddress(){
    const valid=!!addressInput.value.trim();
    if(valid)clearAddressError();
    else{
      addressInput.setAttribute('aria-invalid','true');
      addressError.textContent='Enter a delivery address.';
    }
    return valid;
  }

  function fillOrderModal(){
    document.getElementById('modalItems').innerHTML=cart.getItems().map(item=>`<div class="line"><span>${item.qty||1}× ${item.name} <span style="opacity:.6">· ${item.size.split('·')[0]}</span></span><span>${formatMoney(item.price*(item.qty||1))}</span></div>`).join('');
    const subtotal=cart.sum();
    const fee=mode==='delivery'?DELIVERY_CONFIG.baseFee:0;
    document.getElementById('mSub').textContent=formatMoney(subtotal);
    document.getElementById('mTotal').textContent=formatMoney(subtotal+fee);
    document.getElementById('feeLine').style.display=mode==='delivery'?'flex':'none';
    document.getElementById('addrBlock').style.display=mode==='delivery'?'block':'none';
    document.getElementById('eta').textContent=mode==='delivery'?DELIVERY_CONFIG.deliveryEta:`${DELIVERY_CONFIG.collectionEta} pickup`;
  }

  function setMode(nextMode){
    mode=nextMode;
    document.querySelectorAll('#cartModal .toggle button').forEach(option=>option.classList.toggle('on',option.dataset.mode===mode));
    if(mode==='collection')clearAddressError();
    fillOrderModal();
  }

  function openDeliveryFlow(){
    setMode('delivery');
    const destination=cart.getItems().length?document.getElementById('cartModal'):document.getElementById('cartDD');
    modal.open(destination);
  }

  addressInput.addEventListener('input',()=>{if(addressInput.value.trim())clearAddressError()});

  document.getElementById('goCart').onclick=()=>{
    if(!cart.getItems().length)return;
    fillOrderModal();
    modal.open(document.getElementById('cartModal'));
  };

  document.querySelectorAll('#cartModal .toggle button').forEach(button=>button.onclick=()=>{
    setMode(button.dataset.mode);
  });

  document.getElementById('toCheckout').onclick=()=>{
    if(mode==='delivery'&&!validateAddress()){addressInput.focus();return}
    checkoutForm.style.display='block';
    document.getElementById('checkoutDone').style.display='none';
    modal.open(document.getElementById('checkoutModal'));
  };

  checkoutForm.addEventListener('submit',event=>{
    event.preventDefault();
    let valid=true;
    Object.entries(validators).forEach(([name,test])=>{
      const input=checkoutForm.elements[name];
      const fieldValid=test(input.value);
      const error=input.parentElement.querySelector('.field-error');
      input.setAttribute('aria-invalid',String(!fieldValid));
      error.textContent=fieldValid?'':'Please check this field';
      if(!fieldValid&&valid){input.focus();valid=false}
    });
    if(!valid)return;
    document.getElementById('orderNum').textContent=`#EU-${Math.floor(1000+Math.random()*9000)}`;
    checkoutForm.style.display='none';
    document.getElementById('checkoutDone').style.display='block';
    cart.clear();
    checkoutForm.reset();
    document.querySelector('#checkoutDone [data-close]').focus();
  });

  document.getElementById('card').addEventListener('input',event=>event.target.value=event.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim());
  document.getElementById('expiry').addEventListener('input',event=>{
    const value=event.target.value.replace(/\D/g,'').slice(0,4);
    event.target.value=value.length>2?`${value.slice(0,2)}/${value.slice(2)}`:value;
  });
  document.getElementById('cvc').addEventListener('input',event=>event.target.value=event.target.value.replace(/\D/g,'').slice(0,4));

  return {fillOrderModal,openDeliveryFlow,getMode(){return mode}};
}
