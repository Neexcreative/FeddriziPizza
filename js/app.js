import {createPizzaWheel} from './pizza-wheel.js';
import {createCart} from './cart.js';
import {createModalManager} from './modal.js';
import {initCheckout} from './checkout.js';
import {SOCIAL_LINKS} from './site-config.js';
import {initInformationPanels} from './information.js';

const EMBERS_ENABLED=false;

function createEmberSystem(){
  const canvas=document.getElementById('fx');
  canvas.hidden=!EMBERS_ENABLED;
  if(!EMBERS_ENABLED)return {burst(){}};

  const context=canvas.getContext('2d');
  let width;
  let height;
  const dpr=Math.min(devicePixelRatio||1,2);
  const particles=[];
  let bursts=[];

  function resize(){
    width=innerWidth;
    height=innerHeight;
    canvas.width=width*dpr;
    canvas.height=height*dpr;
    canvas.style.width=`${width}px`;
    canvas.style.height=`${height}px`;
    context.setTransform(dpr,0,0,dpr,0,0);
  }

  function ember(){return{x:Math.random()*width,y:height+10,vx:(Math.random()-.5)*.5,vy:-(.4+Math.random()*1.2),r:Math.random()*2+.5,life:0,max:150+Math.random()*160,hue:20+Math.random()*24}}

  function burst(){
    const x=width/2;
    const y=height*.3;
    for(let i=0;i<24;i++){
      const angle=Math.random()*6.28;
      const speed=1+Math.random()*4;
      bursts.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-1,life:0,max:34+Math.random()*24,r:1+Math.random()*2,hue:24+Math.random()*20});
    }
  }

  function loop(){
    context.clearRect(0,0,width,height);
    context.globalCompositeOperation='lighter';
    for(const particle of particles){
      particle.life++;
      particle.x+=particle.vx+Math.sin(particle.life*.05)*.3;
      particle.y+=particle.vy;
      particle.vy-=.002;
      const alpha=Math.max(0,1-particle.life/particle.max)*.85;
      context.beginPath();
      context.fillStyle=`hsla(${particle.hue},95%,58%,${alpha})`;
      context.shadowBlur=8;
      context.shadowColor=`hsla(${particle.hue},95%,55%,${alpha})`;
      context.arc(particle.x,particle.y,particle.r,0,6.3);
      context.fill();
      if(particle.life>particle.max||particle.y<-20)Object.assign(particle,ember());
    }
    for(const particle of bursts){
      particle.life++;
      particle.x+=particle.vx;
      particle.y+=particle.vy;
      particle.vy+=.06;
      const alpha=Math.max(0,1-particle.life/particle.max);
      context.beginPath();
      context.fillStyle=`hsla(${particle.hue},95%,60%,${alpha})`;
      context.shadowBlur=10;
      context.shadowColor=`hsla(${particle.hue},95%,55%,${alpha})`;
      context.arc(particle.x,particle.y,particle.r,0,6.3);
      context.fill();
    }
    bursts=bursts.filter(particle=>particle.life<particle.max);
    context.shadowBlur=0;
    context.globalCompositeOperation='source-over';
    requestAnimationFrame(loop);
  }

  resize();
  addEventListener('resize',resize);
  for(let i=0;i<80;i++){
    const particle=ember();
    particle.y=Math.random()*height;
    particles.push(particle);
  }
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)loop();
  return {burst};
}

function initialize(){
  const modal=createModalManager();
  const pizzaWheel=createPizzaWheel();
  const embers=createEmberSystem();
  const cart=createCart({pizzaWheel,modal,burst:embers.burst});
  initCheckout({cart,modal});
  const information=initInformationPanels({modal});

  document.querySelector('[data-home]').addEventListener('click',event=>{
    event.preventDefault();
    document.getElementById('main').focus({preventScroll:true});
  });
  document.querySelectorAll('[data-nav-action="delivery"]').forEach(button=>button.addEventListener('click',information.openDelivery));
  document.querySelectorAll('[data-nav-action="faq"]').forEach(button=>button.addEventListener('click',information.openFaq));
  document.querySelectorAll('[data-social]').forEach(link=>{
    const url=SOCIAL_LINKS[link.dataset.social];
    if(url){
      link.href=url;
      link.target='_blank';
      link.rel='noopener noreferrer';
      link.removeAttribute('aria-disabled');
      link.removeAttribute('tabindex');
      return;
    }
    link.removeAttribute('href');
    link.setAttribute('aria-disabled','true');
    link.setAttribute('tabindex','-1');
    link.title=`${link.getAttribute('aria-label')} link pending`;
  });
}

initialize();
