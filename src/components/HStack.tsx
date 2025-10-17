import React from 'react';
import { View, ViewProps } from 'react-native';

interface HStackProps extends ViewProps {
  children?: React.ReactNode;
  space?: number;
  reversed?: boolean;
  alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch';
  justifyContent?: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around';
  style?: ViewProps['style'];
}

export const HStack: React.FC<HStackProps> = ({
  children,
  space = 0,
  reversed = false,
  alignItems = 'center',
  justifyContent = 'flex-start',
  style,
  ...props
}: HStackProps) => {
  const childrenArray = React.Children.toArray(children);
  const reversedChildren = reversed ? childrenArray.reverse() : childrenArray;

  return (
    <View
      style={[
        {
          flexDirection: reversed ? 'row-reverse' : 'row',
          alignItems,
          justifyContent,
        },
        style,
      ]}
      {...props}
    >
      {reversedChildren.map((child, index) => {
        if (index === 0) return child;

        return (
          <React.Fragment key={index}>
            <View style={{ width: space }} />
            {child}
          </React.Fragment>
        );
      })}
    </View>
  );
};
