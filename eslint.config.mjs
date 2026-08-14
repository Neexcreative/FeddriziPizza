import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        addEventListener: 'readonly',
        localStorage: 'readonly',
        devicePixelRatio: 'readonly',
        requestAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        gsap: 'readonly',
        InertiaPlugin: 'readonly',
        matchMedia: 'readonly',
        Math: 'readonly',
        Object: 'readonly',
        Number: 'readonly',
        JSON: 'readonly',
        RangeError: 'readonly',
      },
    },
  },
];
