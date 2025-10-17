# @mobilehisaab/react-native-tabview

A powerful and customizable React Native TabView component with RTL support, smooth animations, and gesture handling.

## Features

- 🎨 **Highly Customizable** - Customize colors, styles, and animations
- 🌍 **RTL Support** - Full right-to-left language support
- 🎭 **Smooth Animations** - Powered by React Native Reanimated
- 👆 **Gesture Handling** - Built-in pan gesture support
- 📱 **Responsive** - Works on all screen sizes
- 🎯 **TypeScript** - Full TypeScript support
- ⚡ **Performance** - Optimized for smooth scrolling
- 🎨 **Theme Support** - Light and dark mode support

## Installation

```bash
npm install @mobilehisaab/react-native-tabview
# or
yarn add @mobilehisaab/react-native-tabview
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react-native-reanimated react-native-gesture-handler react-native-responsive-screen
```

## Quick Start

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { TabView } from '@mobilehisaab/react-native-tabview';

const MyComponent = () => {
  const routes = [
    { key: 'first', title: 'First' },
    { key: 'second', title: 'Second' },
    { key: 'third', title: 'Third' },
  ];

  const renderScene = ({ route, index, isActive }) => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{route.title} Tab</Text>
      </View>
    );
  };

  return (
    <TabView
      routes={routes}
      renderScene={renderScene}
      initialIndex={0}
      onIndexChange={index => console.log('Tab changed:', index)}
    />
  );
};
```

## API Reference

### TabView Props

| Prop                 | Type                                                                                 | Default | Description                               |
| -------------------- | ------------------------------------------------------------------------------------ | ------- | ----------------------------------------- |
| `routes`             | `TabRoute[]`                                                                         | `[]`    | Array of route objects with key and title |
| `initialIndex`       | `number`                                                                             | `0`     | Initial active tab index                  |
| `onIndexChange`      | `(index: number) => void`                                                            | -       | Callback when tab index changes           |
| `renderScene`        | `(params: { route: TabRoute; index: number; isActive: boolean }) => React.ReactNode` | -       | Function to render each tab scene         |
| `isRTL`              | `boolean`                                                                            | `false` | Enable RTL (Right-to-Left) support        |
| `settingTab`         | `boolean`                                                                            | `false` | Special styling for settings tabs         |
| `tabBarStyle`        | `ViewStyle`                                                                          | -       | Custom tab bar style                      |
| `scrollEnabled`      | `boolean`                                                                            | `true`  | Enable/disable tab bar scrolling          |
| `tabBarWidthDivider` | `number`                                                                             | -       | Divide tab bar width by this number       |
| `tabStyle`           | `ViewStyle`                                                                          | -       | Custom tab style                          |
| `activeTabStyle`     | `ViewStyle`                                                                          | -       | Custom active tab style                   |
| `labelStyle`         | `TextStyle`                                                                          | -       | Custom label style                        |
| `activeLabelStyle`   | `TextStyle`                                                                          | -       | Custom active label style                 |
| `indicatorStyle`     | `ViewStyle`                                                                          | -       | Custom indicator style                    |

### TabRoute Interface

```typescript
interface TabRoute {
  key: string;
  title: string;
  [key: string]: any;
}
```

## Examples

### Basic Usage

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TabView } from '@mobilehisaab/react-native-tabview';

const BasicExample = () => {
  const routes = [
    { key: 'home', title: 'Home' },
    { key: 'search', title: 'Search' },
    { key: 'profile', title: 'Profile' },
  ];

  const renderScene = ({ route }) => (
    <View style={styles.scene}>
      <Text style={styles.text}>{route.title} Content</Text>
    </View>
  );

  return <TabView routes={routes} renderScene={renderScene} initialIndex={0} />;
};

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### RTL Support

```tsx
import React from 'react';
import { TabView } from '@mobilehisaab/react-native-tabview';

const RTLExample = () => {
  const routes = [
    { key: 'first', title: 'الأول' },
    { key: 'second', title: 'الثاني' },
    { key: 'third', title: 'الثالث' },
  ];

  return <TabView routes={routes} renderScene={renderScene} isRTL={true} />;
};
```

### Custom Styling

```tsx
import React from 'react';
import { TabView } from '@mobilehisaab/react-native-tabview';

const CustomStyledExample = () => {
  return (
    <TabView
      routes={routes}
      renderScene={renderScene}
      tabBarStyle={{
        backgroundColor: '#2c3e50',
        paddingVertical: 10,
      }}
      activeTabStyle={{
        backgroundColor: '#3498db',
        borderRadius: 20,
      }}
      activeLabelStyle={{
        color: '#ffffff',
        fontWeight: 'bold',
      }}
      indicatorStyle={{
        backgroundColor: '#e74c3c',
        height: 3,
      }}
    />
  );
};
```

### Fixed Width Tabs

```tsx
import React from 'react';
import { TabView } from '@mobilehisaab/react-native-tabview';

const FixedWidthExample = () => {
  return (
    <TabView
      routes={routes}
      renderScene={renderScene}
      tabBarWidthDivider={3} // Each tab takes 1/3 of screen width
      scrollEnabled={false} // Disable scrolling for fixed width
    />
  );
};
```

## Styling

The component uses a theme-based approach for styling. You can customize colors by providing custom styles or by using the built-in theme system.

### Theme Colors

```typescript
const Colors = {
  light: {
    activeTabBackground: '#f0f0f0',
    activeTabText: '#000000',
    textInactiveTab: '#666666',
    // ... more colors
  },
  dark: {
    activeTabBackground: '#333333',
    activeTabText: '#ffffff',
    textInactiveTab: '#999999',
    // ... more colors
  },
};
```

## Performance Tips

1. **Memoize your renderScene function** to prevent unnecessary re-renders
2. **Use `removeClippedSubviews={true}`** for better performance with many tabs
3. **Avoid complex animations in renderScene** for smoother scrolling

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [MobileHisaab Team](https://github.com/mobilehisaab)

## Support

If you have any questions or need help, please:

1. Check the [documentation](https://github.com/mobilehisaab/react-native-tabview#readme)
2. Search [existing issues](https://github.com/mobilehisaab/react-native-tabview/issues)
3. Create a [new issue](https://github.com/mobilehisaab/react-native-tabview/issues/new)

---

Made with ❤️ by the MobileHisaab Team
