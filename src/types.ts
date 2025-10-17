import { ViewStyle, TextStyle } from 'react-native';

export interface TabRoute {
  key: string;
  title: string;
  [key: string]: any;
}

export interface TabViewProps {
  /** Array of route objects with key and title */
  routes?: TabRoute[];
  /** Initial active tab index */
  initialIndex?: number;
  /** Callback when tab index changes */
  onIndexChange?: (index: number) => void;
  /** Function to render each tab scene */
  renderScene: (params: { route: TabRoute; index: number; isActive: boolean }) => React.ReactNode;
  /** Enable RTL (Right-to-Left) support */
  isRTL?: boolean;
  /** Special styling for settings tabs */
  settingTab?: boolean;
  /** Custom tab bar style */
  tabBarStyle?: ViewStyle;
  /** Enable/disable tab bar scrolling */
  scrollEnabled?: boolean;
  /** Divide tab bar width by this number */
  tabBarWidthDivider?: number;
  /** Custom tab style */
  tabStyle?: ViewStyle;
  /** Custom active tab style */
  activeTabStyle?: ViewStyle;
  /** Custom label style */
  labelStyle?: TextStyle;
  /** Custom active label style */
  activeLabelStyle?: TextStyle;
  /** Custom indicator style */
  indicatorStyle?: ViewStyle;
}

export interface TabBarProps {
  routes: TabRoute[];
  currentIndex: number;
  onTabPress: (index: number) => void;
  isRTL?: boolean;
  scrollEnabled?: boolean;
  tabBarWidthDivider?: number;
  tabStyle?: ViewStyle;
  activeTabStyle?: ViewStyle;
  labelStyle?: TextStyle;
  activeLabelStyle?: TextStyle;
  indicatorStyle?: ViewStyle;
  settingTab?: boolean;
  colorMode?: 'light' | 'dark';
}
