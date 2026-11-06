const React = require('react');
const { View } = require('react-native');

module.exports = new Proxy(
  {},
  {
    get: (_target, name) =>
      name === '__esModule' ? true : () => React.createElement(View),
  },
);
