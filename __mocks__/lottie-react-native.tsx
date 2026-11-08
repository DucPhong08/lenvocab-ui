import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';

export const commands = {
  play: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
};
export default forwardRef(function LottieMock(props: object, ref) {
  useImperativeHandle(ref, () => commands, []);
  return <View {...props} testID="lottie-view" />;
});
