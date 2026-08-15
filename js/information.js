import {DELIVERY_CONFIG,calculateDeliveryFee,FLAVORS,EXTRAS} from './site-config.js';

const money=value=>`€${value.toFixed(2)}`;

const faqs=[
  ['Do you offer delivery?',()=>`Yes. Delivery is available depending on your location. The standard delivery fee is ${money(DELIVERY_CONFIG.baseFee)} for addresses within ${DELIVERY_CONFIG.standardRadiusKm} km. Additional distance charges may apply beyond ${DELIVERY_CONFIG.standardRadiusKm} km.`],
  ['How much does delivery cost?',()=>`Standard delivery is ${money(DELIVERY_CONFIG.baseFee)} for addresses up to ${DELIVERY_CONFIG.standardRadiusKm} km. For distances above ${DELIVERY_CONFIG.standardRadiusKm} km, the current prototype rate adds ${money(DELIVERY_CONFIG.extraFeePerKm)} per additional kilometre.`],
  ['How long does delivery take?',()=>`Typical delivery time is approximately ${DELIVERY_CONFIG.deliveryEta}. Busy periods and conditions outside our control may increase this time.`],
  ['Can I collect my order?',()=>`Yes. Collection is available and usually takes approximately ${DELIVERY_CONFIG.collectionEta}. There is no delivery fee for collection.`],
  ['Can I change my pizza?',()=>`Pizza customisation is not currently available in this prototype. The system can support custom options in a future version.`],
  ['Do you have vegetarian options?',()=>`Yes. Vegetarian pizzas are clearly identified in the menu.`],
  ['What if I have a food allergy?',()=>`Customers with allergies or intolerances should contact the restaurant before ordering. Food is prepared in an environment where common allergens may be present.`],
  ['Can I order in advance?',()=>`Scheduled ordering is not currently available in this prototype but may be introduced later.`],
  ['How can I check my order?',()=>`Order tracking is not yet connected to a live kitchen or order-management system. Production integration can add order status updates later.`],
  ['What payment methods do you accept?',()=>`The current checkout is a demonstration only. Production payment methods will be confirmed when a real payment provider is connected.`]
];

export function initInformationPanels({modal}){
  const deliveryContent=document.getElementById('deliveryInfoContent');
  const fullMenuContent=document.getElementById('fullMenuContent');
  const faqList=document.getElementById('faqList');
  const examples=[5,10,12,15];

  fullMenuContent.innerHTML=`
    <section class="info-section"><h3>Flavours</h3><div class="menu-flavors">${FLAVORS.map(flavor=>`
      <div class="menu-flavor">
        <h4>${flavor.name} ${flavor.tags.map(tag=>`<span class="tag ${tag==='Vegetarian'?'v':''}">${tag}</span>`).join('')}</h4>
        <p>${flavor.ing}</p>
      </div>`).join('')}</div>
    </section>
    <section class="info-section"><h3>Extras</h3>${Object.entries(EXTRAS).map(([category,items])=>`
      <div class="menu-extra-group">
        <h4>${category}</h4>
        <div class="side-list">${items.map(item=>`<div class="sr"><span>${item.name}</span><span>${money(item.price)}</span></div>`).join('')}</div>
      </div>`).join('')}
    </section>`;

  deliveryContent.innerHTML=`
    <div class="info-grid">
      <section class="info-card"><h3>Delivery fee</h3><p>Our base delivery fee is <strong>${money(DELIVERY_CONFIG.baseFee)}</strong> for addresses up to <strong>${DELIVERY_CONFIG.standardRadiusKm} km</strong>.</p><p>Above ${DELIVERY_CONFIG.standardRadiusKm} km, the current prototype rule adds <strong>${money(DELIVERY_CONFIG.extraFeePerKm)} per additional kilometre</strong>.</p></section>
      <section class="info-card"><h3>Estimated times</h3><p>Typical delivery time is approximately <strong>${DELIVERY_CONFIG.deliveryEta}</strong>. Busy periods, weather or unusually high demand may take longer.</p><p>Collection typically takes <strong>${DELIVERY_CONFIG.collectionEta}</strong> and has no delivery fee.</p></section>
    </div>
    <section class="info-section"><h3>Distance examples</h3><div class="delivery-examples">${examples.map(distance=>{
      const fee=calculateDeliveryFee(distance);
      const extra=Math.max(0,distance-DELIVERY_CONFIG.standardRadiusKm);
      const calculation=extra?`${money(DELIVERY_CONFIG.baseFee)} + ${extra} × ${money(DELIVERY_CONFIG.extraFeePerKm)} = ${money(fee)}`:money(fee);
      return `<div><span>${distance} km</span><strong>Delivery fee: ${calculation}</strong></div>`;
    }).join('')}</div><p class="info-note">These examples are informational. Checkout keeps the ${money(DELIVERY_CONFIG.baseFee)} base fee while real distance is unknown. A final distance-based charge may apply and will be confirmed before an order is completed when distance calculation becomes available.</p></section>
    <section class="info-section"><h3>Delivery conditions</h3><ul><li>Availability depends on the delivery address; very distant addresses may not be available.</li><li>Times are estimates, not guaranteed arrival times.</li><li>Provide a complete address, including apartment or unit number and access instructions where relevant.</li><li>Provide a reachable phone number. The restaurant may contact you if the driver cannot locate the address.</li><li>Final delivery availability is confirmed during the ordering process.</li></ul></section>
    <section class="info-section allergy-note"><h3>Food allergies</h3><p>If you have a food allergy or intolerance, contact the restaurant before placing your order. Food is prepared in an environment where common allergens may be present.</p></section>`;

  faqList.innerHTML=faqs.map(([question,answer],index)=>`<div class="faq-item"><h3><button type="button" aria-expanded="false" aria-controls="faq-answer-${index}" id="faq-question-${index}">${question}</button></h3><div class="faq-answer" id="faq-answer-${index}" role="region" aria-labelledby="faq-question-${index}" hidden><p>${answer()}</p></div></div>`).join('');

  faqList.addEventListener('click',event=>{
    const button=event.target.closest('button[aria-controls]');
    if(!button)return;
    const willOpen=button.getAttribute('aria-expanded')!=='true';
    faqList.querySelectorAll('button[aria-controls]').forEach(item=>{
      item.setAttribute('aria-expanded','false');
      document.getElementById(item.getAttribute('aria-controls')).hidden=true;
    });
    if(willOpen){
      button.setAttribute('aria-expanded','true');
      document.getElementById(button.getAttribute('aria-controls')).hidden=false;
    }
  });

  return {
    openDelivery(){modal.open(document.getElementById('deliveryInfoModal'))},
    openFaq(){modal.open(document.getElementById('faqModal'))},
    openFullMenu(){modal.open(document.getElementById('fullMenuModal'))}
  };
}
