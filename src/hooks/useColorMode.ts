import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type ColorMode = 'light' | 'dark';

export const useColorMode = () => {
  const [colorMode, setColorMode] = useState<ColorMode>('light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorMode(colorScheme === 'dark' ? 'dark' : 'light');
    });

    // Set initial color mode
    const initialColorScheme = Appearance.getColorScheme();
    setColorMode(initialColorScheme === 'dark' ? 'dark' : 'light');

    return () => subscription?.remove();
  }, []);

  return { colorMode };
};
