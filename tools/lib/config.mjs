import { readFile } from 'node:fs/promises';

const CONFIG_PATH = new URL('../../config/pizzeria.json', import.meta.url);

export async function readPizzeriaConfig() {
  const raw = await readFile(CONFIG_PATH, 'utf8');
  const config = JSON.parse(raw);

  const errors = [];
  if (!config.brand?.name) errors.push('brand.name is required');
  if (!config.brand?.color) errors.push('brand.color is required (e.g. "#e5462c")');
  if (!Array.isArray(config.flavors) || config.flavors.length < 1) errors.push('flavors must be a non-empty array');
  if (!Array.isArray(config.sizes) || config.sizes.length < 1) errors.push('sizes must be a non-empty array');
  config.flavors?.forEach((flavor, index) => {
    if (!flavor.name) errors.push(`flavors[${index}].name is required`);
    if (!flavor.ingredients) errors.push(`flavors[${index}].ingredients is required`);
  });

  if (errors.length) {
    throw new Error(`config/pizzeria.json is invalid:\n  - ${errors.join('\n  - ')}`);
  }

  return config;
}
