// TODO: Replace null values only with verified Fedrizzi Pizza business URLs.
// Keeping these values centralized makes future activation explicit and auditable.
export const SOCIAL_LINKS=Object.freeze({
  instagram:null,
  facebook:null,
  google:null,
  whatsapp:null
});

export const DELIVERY_CONFIG=Object.freeze({
  baseFee:3.5,
  standardRadiusKm:10,
  extraFeePerKm:0.75,
  deliveryEta:'30–40 min',
  collectionEta:'15–20 min'
});

export function calculateDeliveryFee(distanceKm){
  const distance=Number(distanceKm);
  if(!Number.isFinite(distance)||distance<0)throw new RangeError('Distance must be a non-negative number.');
  const extraDistance=Math.max(0,distance-DELIVERY_CONFIG.standardRadiusKm);
  return Math.round((DELIVERY_CONFIG.baseFee+extraDistance*DELIVERY_CONFIG.extraFeePerKm)*100)/100;
}
