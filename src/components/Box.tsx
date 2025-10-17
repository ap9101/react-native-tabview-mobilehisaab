import React from 'react';
import { View, ViewProps, Pressable, PressableProps } from 'react-native';

interface BoxProps extends Omit<ViewProps, 'style'> {
   children?: React.ReactNode;
   onPress?: () => void;
   backgroundColor?: string;
   paddingVertical?: number;
   paddingHorizontal?: number;
   borderRadius?: string | number;
   alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch';
   justifyContent?: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around';
   width?: number | string;
   height?: number | string;
   flex?: number;
   style?: ViewProps['style'];
}

export const Box: React.FC<BoxProps> = ({
   children,
   onPress,
   backgroundColor,
   paddingVertical,
   paddingHorizontal,
   borderRadius,
   alignItems,
   justifyContent,
   width,
   height,
   flex,
   style,
   ...props
}: BoxProps) => {
   const boxStyle = [
      {
         backgroundColor,
         paddingVertical,
         paddingHorizontal,
         borderRadius,
         alignItems,
         justifyContent,
         width,
         height,
         flex,
      },
      style,
   ];

   if (onPress) {
      return (
         <Pressable onPress={onPress} style={boxStyle} {...(props as any)}>
            {children}
         </Pressable>
      );
   }

   return (
      <View style={boxStyle} {...(props as any)}>
         {children}
      </View>
   );
};
