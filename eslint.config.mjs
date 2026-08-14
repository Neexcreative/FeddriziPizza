import js from '@eslint/js';

export default [
  { ignores: ['js/vendor/**'] },
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
        innerWidth: 'readonly',
        innerHeight: 'readonly',
        cancelAnimationFrame: 'readonly',
        requestAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        getComputedStyle: 'readonly',
        Element: 'readonly',
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
