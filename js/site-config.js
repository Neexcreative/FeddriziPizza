// GERADO AUTOMATICAMENTE por "npm run build" a partir de config/pizzeria.json.
// Nao edite este arquivo direto: suas mudancas serao substituidas no proximo build.
// Para mudar sabores, tamanhos, entrega ou redes sociais, edite config/pizzeria.json.

export const FLAVORS = [
  {
    "name": "Pepperoni",
    "ing": "Mozzarella, spicy pepperoni, tomato base",
    "tags": [
      "Gluten",
      "Dairy"
    ]
  },
  {
    "name": "Veggie Supreme",
    "ing": "Cherry tomato, peppers, mozzarella, garden veg",
    "tags": [
      "Vegetarian",
      "Gluten",
      "Dairy"
    ]
  },
  {
    "name": "Mushroom & Ham",
    "ing": "Mushrooms, ham, mozzarella",
    "tags": [
      "Gluten",
      "Dairy"
    ]
  },
  {
    "name": "Mediterranean",
    "ing": "Green olives, green pepper, mozzarella, basil",
    "tags": [
      "Vegetarian",
      "Gluten",
      "Dairy"
    ]
  },
  {
    "name": "Hawaiian",
    "ing": "Ham, pineapple, mozzarella",
    "tags": [
      "Gluten",
      "Dairy"
    ]
  },
  {
    "name": "Greek Supreme",
    "ing": "Black olives, peppers, tomato, feta",
    "tags": [
      "Vegetarian",
      "Gluten",
      "Dairy"
    ]
  },
  {
    "name": "Ham & Onion",
    "ing": "Caramelised onion, ham, mozzarella, white base",
    "tags": [
      "Gluten",
      "Dairy"
    ]
  },
  {
    "name": "Italian Supreme",
    "ing": "Black olives, salami, tomato, mozzarella",
    "tags": [
      "Gluten",
      "Dairy"
    ]
  }
];

export const SIZES = [
  {
    "k": "Small",
    "slices": 4,
    "price": 18
  },
  {
    "k": "Medium",
    "slices": 8,
    "price": 22
  },
  {
    "k": "Large",
    "slices": 12,
    "price": 28
  }
];

export const SOCIAL_LINKS = Object.freeze({
  "instagram": null,
  "facebook": null,
  "google": null,
  "whatsapp": null
});

export const DELIVERY_CONFIG = Object.freeze({
  "baseFee": 3.5,
  "standardRadiusKm": 10,
  "extraFeePerKm": 0.75,
  "deliveryEta": "30–40 min",
  "collectionEta": "15–20 min"
});

export function calculateDeliveryFee(distanceKm) {
  const distance = Number(distanceKm);
  if (!Number.isFinite(distance) || distance < 0) throw new RangeError('Distance must be a non-negative number.');
  const extraDistance = Math.max(0, distance - DELIVERY_CONFIG.standardRadiusKm);
  return Math.round((DELIVERY_CONFIG.baseFee + extraDistance * DELIVERY_CONFIG.extraFeePerKm) * 100) / 100;
}
