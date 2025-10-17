import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ScrollView, Dimensions, Platform, ViewStyle, LayoutChangeEvent } from 'react-native';
import Animated, {
   useSharedValue,
   useAnimatedStyle,
   useAnimatedScrollHandler,
   withTiming,
   withSpring,
   runOnJS,
   interpolate,
   Extrapolate,
   useDerivedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Box, HStack, Text } from './components';
import { useColorMode } from './hooks/useColorMode';
import { FontStyles, SCREEN_WIDTH } from './constants';
import { TabViewProps, TabRoute } from './types';

const { width: screenWidth } = Dimensions.get('window');

const TabView: React.FC<TabViewProps> = ({
   routes = [],
   initialIndex = 0,
   onIndexChange,
   renderScene,
   isRTL = false,
   settingTab = false,
   tabBarStyle,
   scrollEnabled = true,
   tabBarWidthDivider,
   tabStyle,
   activeTabStyle,
   labelStyle,
   activeLabelStyle,
   indicatorStyle,
   showIndicator = true,
}) => {
   const [currentIndex, setCurrentIndex] = useState(initialIndex);
   const [tabWidths, setTabWidths] = useState<number[]>([]);
   const [tabBarWidth, setTabBarWidth] = useState(screenWidth);

   const scrollViewRef = useRef<Animated.ScrollView>(null);
   const tabScrollViewRef = useRef<ScrollView>(null);
   const isUserScrolling = useRef(false);
   const isInitialized = useRef(false);

   const scrollX = useSharedValue(initialIndex * screenWidth);
   const { colorMode } = useColorMode();

   // Calculate tab width based on content and screen
   const calculateTabWidth = useCallback((title: string, index: number) => {
      if (tabBarWidthDivider) {
         return screenWidth / tabBarWidthDivider;
      }

      // Estimate text width (rough calculation)
      const estimatedTextWidth = title.length * 8 + 32; // 8px per char + padding
      const minWidth = Math.max(estimatedTextWidth, 80);
      const maxWidth = screenWidth / 3;

      return Math.min(maxWidth, minWidth);
   }, [tabBarWidthDivider]);

   // Calculate all tab widths
   const calculatedTabWidths = useMemo(() => {
      return routes.map((route, index) => calculateTabWidth(route.title, index));
   }, [routes, calculateTabWidth]);

   // Update tab widths when routes change
   useEffect(() => {
      setTabWidths(calculatedTabWidths);
   }, [calculatedTabWidths]);

   // Calculate tab positions for scrolling
   const tabPositions = useMemo(() => {
      let position = 0;
      return tabWidths.map((width, index) => {
         const currentPosition = position;
         position += width;
         return currentPosition;
      });
   }, [tabWidths]);

   // Scroll to specific tab in tab bar
   const scrollToTabInTabBar = useCallback((index: number, animated = true) => {
      if (!tabScrollViewRef.current || tabWidths.length === 0 || !scrollEnabled) return;

      const tabPosition = tabPositions[index] || 0;
      const tabWidth = tabWidths[index] || 100;
      const centerPosition = tabPosition + tabWidth / 2;
      const scrollPosition = Math.max(0, centerPosition - screenWidth / 2);

      tabScrollViewRef.current.scrollTo({
         x: scrollPosition,
         animated,
      });
   }, [tabPositions, tabWidths, scrollEnabled]);

   // Enhanced scroll to tab function
   const scrollToTab = useCallback((index: number, animated = true) => {
      const targetX = index * screenWidth;

      // Update shared value immediately for smooth animations
      if (animated) {
         scrollX.value = withTiming(targetX, {
            duration: 300,
         });
      } else {
         scrollX.value = targetX;
      }

      // Scroll main content
      if (scrollViewRef.current) {
         scrollViewRef.current.scrollTo({
            x: targetX,
            animated,
         });
      }

      // Scroll tab bar with slight delay for better UX
      if (animated) {
         setTimeout(() => scrollToTabInTabBar(index, true), 50);
      } else {
         scrollToTabInTabBar(index, false);
      }
   }, [scrollX, scrollToTabInTabBar]);

   // Initialize position
   useEffect(() => {
      if (!isInitialized.current && tabWidths.length > 0) {
         scrollToTab(initialIndex, false);
         setCurrentIndex(initialIndex);
         isInitialized.current = true;
      }
   }, [initialIndex, scrollToTab, tabWidths.length]);

   // Handle tab press with optimized performance
   const handleTabPress = useCallback((index: number) => {
      if (index === currentIndex) return;

      // Immediate state update for instant feedback
      setCurrentIndex(index);
      onIndexChange?.(index);

      // Animate to new position
      isUserScrolling.current = false;
      scrollToTab(index, true);
   }, [currentIndex, onIndexChange, scrollToTab]);

   // Update index from scroll
   const updateIndex = useCallback((newIndex: number) => {
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < routes.length) {
         setCurrentIndex(newIndex);
         onIndexChange?.(newIndex);

         // Update tab bar scroll position
         scrollToTabInTabBar(newIndex, true);
      }
   }, [currentIndex, onIndexChange, routes.length, scrollToTabInTabBar]);

   // Optimized scroll handler
   const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
         scrollX.value = event.contentOffset.x;

         if (isUserScrolling.current) {
            const newIndex = Math.round(event.contentOffset.x / screenWidth);
            const clampedIndex = Math.max(0, Math.min(newIndex, routes.length - 1));

            runOnJS(updateIndex)(clampedIndex);
         }
      },
      onBeginDrag: () => {
         isUserScrolling.current = true;
      },
      onEndDrag: () => {
         isUserScrolling.current = false;
      },
   });

   // Optimized indicator animation
   const indicatorAnimatedStyle = useAnimatedStyle(() => {
      if (tabWidths.length === 0) return { opacity: 0 };

      const inputRange = routes.map((_, i) => i * screenWidth);
      const outputRange = tabPositions;

      const translateX = interpolate(
         scrollX.value,
         inputRange,
         outputRange,
         Extrapolate.CLAMP,
      );

      const widthInputRange = routes.map((_, i) => i * screenWidth);
      const widthOutputRange = tabWidths;

      const width = interpolate(
         scrollX.value,
         widthInputRange,
         widthOutputRange,
         Extrapolate.CLAMP,
      );

      return {
         transform: [{ translateX }],
         width,
         opacity: 1,
      };
   }, [tabWidths, tabPositions]);

   // Optimized tab animation
   const getTabAnimatedStyle = useCallback((index: number) => {
      return useAnimatedStyle(() => {
         const inputRange = [
            (index - 1) * screenWidth,
            index * screenWidth,
            (index + 1) * screenWidth,
         ];

         const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.6, 1, 0.6],
            Extrapolate.CLAMP,
         );

         const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.95, 1, 0.95],
            Extrapolate.CLAMP,
         );

         return {
            opacity,
            transform: [{ scale }],
         };
      });
   }, [scrollX]);

   // Handle tab bar layout
   const handleTabBarLayout = useCallback((event: LayoutChangeEvent) => {
      setTabBarWidth(event.nativeEvent.layout.width);
   }, []);

   // Enhanced tab bar design
   const renderTabBar = () => (
      <Box
         style={[
            {
               backgroundColor: colorMode === 'dark' ? '#1a1a1a' : '#ffffff',
               shadowColor: '#000',
               shadowOffset: { width: 0, height: 2 },
               shadowOpacity: 0.1,
               shadowRadius: 8,
               elevation: 4,
               borderBottomWidth: 1,
               borderBottomColor: colorMode === 'dark' ? '#333' : '#f0f0f0',
            },
            tabBarStyle
         ]}
         paddingHorizontal={16}
         paddingVertical={12}
         onLayout={handleTabBarLayout}
      >
         <ScrollView
            ref={tabScrollViewRef}
            horizontal
            scrollEnabled={scrollEnabled}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
               paddingHorizontal: 0,
               flexDirection: 'row',
            }}
            style={{ flexGrow: 0 }}
         >
            {routes.map((route, index) => {
               const isActive = currentIndex === index;
               const animatedStyle = getTabAnimatedStyle(index);
               const tabWidth = tabWidths[index] || 100;

               return (
                  <Box
                     key={route.key}
                     onPress={() => handleTabPress(index)}
                     style={[
                        {
                           width: tabWidth,
                           paddingVertical: 12,
                           paddingHorizontal: 16,
                           alignItems: 'center',
                           justifyContent: 'center',
                           borderRadius: showIndicator ? 0 : 12,
                           marginHorizontal: showIndicator ? 0 : 4,
                           backgroundColor: showIndicator
                              ? 'transparent'
                              : (isActive
                                 ? (colorMode === 'dark' ? '#007AFF' : '#007AFF')
                                 : 'transparent'),
                        },
                        isActive ? activeTabStyle : tabStyle,
                     ]}
                  >
                     <Animated.View style={[{ alignItems: 'center' }, animatedStyle]}>
                        <Text
                           color={showIndicator
                              ? (isActive
                                 ? (colorMode === 'dark' ? '#007AFF' : '#007AFF')
                                 : (colorMode === 'dark' ? '#ffffff' : '#666666'))
                              : (isActive
                                 ? '#ffffff'
                                 : (colorMode === 'dark' ? '#ffffff' : '#666666'))
                           }
                           fontSize={16}
                           fontWeight={isActive ? '600' : '500'}
                           fontFamily={FontStyles.interMedium.fontFamily}
                           textAlign="center"
                           numberOfLines={1}
                           style={[
                              {
                                 textShadowColor: isActive && !showIndicator ? 'rgba(0,0,0,0.1)' : 'transparent',
                                 textShadowOffset: { width: 0, height: 1 },
                                 textShadowRadius: 2,
                              },
                              isActive ? activeLabelStyle : labelStyle
                           ]}
                        >
                           {route.title}
                        </Text>
                     </Animated.View>
                  </Box>
               );
            })}

            {/* Enhanced Indicator - only show if showIndicator is true */}
            {showIndicator && tabWidths.length > 0 && (
               <Animated.View
                  style={[
                     {
                        position: 'absolute',
                        bottom: 4,
                        height: 3,
                        backgroundColor: colorMode === 'dark' ? '#007AFF' : '#007AFF',
                        borderRadius: 2,
                        shadowColor: '#007AFF',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 3,
                     },
                     indicatorAnimatedStyle,
                     indicatorStyle,
                  ]}
               />
            )}
         </ScrollView>
      </Box>
   );

   return (
      <Box flex={1} style={{ backgroundColor: colorMode === 'dark' ? '#000000' : '#ffffff' }}>
         {renderTabBar()}

         <GestureDetector gesture={Gesture.Pan()}>
            <Animated.ScrollView
               ref={scrollViewRef}
               horizontal
               pagingEnabled
               scrollEventThrottle={16}
               showsHorizontalScrollIndicator={false}
               onScroll={scrollHandler}
               bounces={false}
               decelerationRate="fast"
               snapToInterval={screenWidth}
               snapToAlignment="center"
               contentContainerStyle={{
                  width: screenWidth * routes.length,
               }}
               style={{ flex: 1 }}
            >
               {routes.map((route, index) => {
                  return (
                     <Box
                        key={route.key}
                        width={screenWidth}
                        style={{
                           backgroundColor: colorMode === 'dark' ? '#000000' : '#ffffff',
                        }}
                     >
                        {renderScene({ route, index, isActive: currentIndex === index })}
                     </Box>
                  );
               })}
            </Animated.ScrollView>
         </GestureDetector>
      </Box>
   );
};

export default TabView;