import { Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Font families
export const FontStyles = {
  interMedium: {
    fontFamily: 'Inter-Medium',
  },
  interBold: {
    fontFamily: 'Inter-Bold',
  },
  interRegular: {
    fontFamily: 'Inter-Regular',
  },
  interSemiBold: {
    fontFamily: 'Inter-SemiBold',
  },
};

// Default colors for theming
export const Colors = {
  light: {
    activeTabBackground: '#f0f0f0',
    activeTabText: '#000000',
    textInactiveTab: '#666666',
    popupBackground: '#ffffff',
    textsubtitle: '#333333',
    textMuted: '#666666',
    primary500: '#007AFF',
  },
  dark: {
    activeTabBackground: '#333333',
    activeTabText: '#ffffff',
    textInactiveTab: '#999999',
    popupBackground: '#1a1a1a',
    textsubtitle: '#ffffff',
    textMuted: '#cccccc',
    primary500: '#007AFF',
  },
};
