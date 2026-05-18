export default {
    testEnvironment: 'node',
    testTimeout: 10000,
    setupFilesAfterEnv: ['./src/tests/setup/db.setup.js'],
    clearMocks: true,
    transform: {} 
};