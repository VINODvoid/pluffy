# Input Component Tests

This test file provides comprehensive coverage for the Input component including:

- Basic rendering and HTML structure
- All HTML input types (text, email, password, number, etc.)
- Props forwarding (all HTML input attributes)
- Event handler forwarding
- Accessibility attributes
- className merging via cn utility
- Ref forwarding
- Edge cases and error handling
- Form integration
- Complex styling scenarios

## Testing Framework

These tests are designed to work with either Jest or Vitest. To run them, you'll need to install:

### For Jest:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @types/jest
```

### For Vitest:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

## Running Tests

Add to your package.json scripts:
```json
{
  "scripts": {
    "test": "jest" // or "vitest"
  }
}
```

Then run: `npm test`