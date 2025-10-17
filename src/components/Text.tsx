import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends Omit<RNTextProps, 'style'> {
   children?: React.ReactNode;
   color?: string;
   fontSize?: number;
   fontFamily?: string;
   fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
   textAlign?: 'left' | 'center' | 'right' | 'justify';
   numberOfLines?: number;
   allowFontScaling?: boolean;
   style?: RNTextProps['style'];
}

export const Text: React.FC<TextProps> = ({
   children,
   color,
   fontSize,
   fontFamily,
   fontWeight,
   textAlign,
   numberOfLines,
   allowFontScaling = true,
   style,
   ...props
}: TextProps) => {
   return (
      <RNText
         style={[
            {
               color,
               fontSize,
               fontFamily,
               fontWeight,
               textAlign,
            },
            style,
         ]}
         numberOfLines={numberOfLines}
         allowFontScaling={allowFontScaling}
         {...props}
      >
         {children}
      </RNText>
   );
};
