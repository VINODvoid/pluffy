# Testing Guide

This project uses Jest for unit testing.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Test Structure

- Tests are located alongside source files with `.test.ts` extension
- Uses Jest with TypeScript support via `ts-jest`
- Mocks external dependencies like `@inngest/agent-kit`

## Test Coverage

The test suite covers:
- Function configuration and setup
- Agent creation and configuration
- Happy path execution scenarios  
- Edge cases and error handling
- Response format validation
- Concurrency and performance
- Integration scenarios
- Real-world usage patterns

## Testing Framework

- **Framework**: Jest 29.7.0
- **Environment**: Node.js
- **TypeScript**: Supported via ts-jest
- **Mocking**: Jest built-in mocking capabilities