const loginPanes={
  Profile:'Your saved details, delivery addresses and preferences live here.',
  Rewards:'Earn a slice stamp on every order. 8 stamps = a free Large pizza.',
  Cards:'Saved payment cards for one-tap checkout.',
  History:'Reorder your favourites in one tap from past orders.',
  Help:'Chat with the kitchen: order status, allergies, custom requests.'
};

export function createModalManager(){
  const scrim=document.getElementById('scrim');
  const cartButton=document.getElementById('cartBtn');
  const mobileMenuButton=document.getElementById('mobileMenuBtn');
  let openElement=null;
  let returnFocus=null;

  const isVisible=element=>!!(element?.isConnected&&element.getClientRects().length&&getComputedStyle(element).visibility!=='hidden');
  const focusableItems=container=>[...container.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href],[contenteditable],[tabindex]:not([tabindex="-1"])')].filter(isVisible);

  function open(element){
    const trigger=document.activeElement;
    if(!openElement?.contains(trigger)&&isVisible(trigger))returnFocus=trigger;
    close(false);
    openElement=element;
    element.classList.add('show');
    scrim.classList.add('show');
    cartButton.setAttribute('aria-expanded',String(element.id==='cartDD'));
    mobileMenuButton.setAttribute('aria-expanded',String(element.id==='mobileMenu'));
    setTimeout(()=>focusableItems(element)[0]?.focus(),60);
  }

  function close(restore=true){
    document.querySelectorAll('.sheet.show').forEach(sheet=>sheet.classList.remove('show'));
    scrim.classList.remove('show');
    cartButton.setAttribute('aria-expanded','false');
    mobileMenuButton.setAttribute('aria-expanded','false');
    openElement=null;
    if(restore){
      const target=isVisible(returnFocus)?returnFocus:cartButton;
      returnFocus=null;
      target.focus();
    }
  }

  function setAccountTab(tab){
    document.querySelectorAll('#loginTabs button').forEach(button=>button.classList.toggle('on',button.dataset.tab===tab));
    document.getElementById('loginPane').textContent=loginPanes[tab];
  }

  scrim.onclick=close;
  document.querySelectorAll('[data-close]').forEach(button=>button.onclick=close);
  cartButton.onclick=event=>{event.stopPropagation();openElement===document.getElementById('cartDD')?close():open(document.getElementById('cartDD'))};
  mobileMenuButton.onclick=event=>{event.stopPropagation();openElement===document.getElementById('mobileMenu')?close():open(document.getElementById('mobileMenu'))};
  document.getElementById('mobileAccount').onclick=()=>{setAccountTab('Profile');open(document.getElementById('loginModal'))};
  document.getElementById('loginBtn').onclick=()=>{setAccountTab('Profile');open(document.getElementById('loginModal'))};
  document.querySelectorAll('#loginTabs button').forEach(button=>button.onclick=()=>setAccountTab(button.dataset.tab));

  addEventListener('keydown',event=>{
    if(event.key==='Escape'&&openElement){close();return}
    if(event.key!=='Tab'||!openElement)return;
    const items=focusableItems(openElement);
    if(!items.length)return;
    const first=items[0];
    const last=items.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  });

  setAccountTab('Profile');

  return {
    open,
    close,
    isOpen(){return !!openElement},
    getOpenElement(){return openElement},
    focusableItems
  };
}
