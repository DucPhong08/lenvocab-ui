module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@react-native-google-signin/google-signin$': '<rootDir>/__mocks__/google-signin.tsx',
    '^lottie-react-native$': '<rootDir>/__mocks__/lottie-react-native.tsx',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
