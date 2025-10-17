import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ScrollView, Dimensions, Platform, StatusBar, ViewStyle } from 'react-native';
import Animated, {
   useSharedValue,
   useAnimatedStyle,
   useAnimatedScrollHandler,
   withTiming,
   withSpring,
   runOnJS,
   interpolate,
   Extrapolate,
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
   showIndicator = true, // New prop with default true
}) => {
   const [currentIndex, setCurrentIndex] = useState(initialIndex);
   const scrollViewRef = useRef<Animated.ScrollView>(null);
   const tabScrollViewRef = useRef<ScrollView>(null);
   const isUserScrolling = useRef(false);

   const scrollX = useSharedValue(initialIndex * screenWidth);
   const { colorMode } = useColorMode();

   // Calculate tab width based on screen and number of tabs
   const tabWidth = useMemo(() => {
      if (tabBarWidthDivider) {
         return screenWidth / tabBarWidthDivider;
      }

      // If tabs fit on screen, distribute evenly
      if (routes.length <= 4) {
         return (screenWidth - 32) / routes.length; // 32 for padding
      }

      // For more tabs, use minimum width
      return Math.max(120, screenWidth / 4);
   }, [routes.length, tabBarWidthDivider]);

   // Enhanced scroll to tab function
   const scrollToTab = useCallback((index: number, animated = true) => {
      const targetX = index * screenWidth;

      // Update shared value for animations
      if (animated) {
         scrollX.value = withSpring(targetX, {
            damping: 20,
            stiffness: 300,
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

      // Scroll tab bar if needed
      if (tabScrollViewRef.current && routes.length > 4) {
         const tabBarScrollX = Math.max(0, index * tabWidth - screenWidth / 2 + tabWidth / 2);
         setTimeout(() => {
            tabScrollViewRef.current?.scrollTo({
               x: tabBarScrollX,
               animated: true,
            });
         }, animated ? 50 : 0);
      }
   }, [routes.length, tabWidth, scrollX]);

   // Initialize position
   useEffect(() => {
      scrollToTab(initialIndex, false);
      setCurrentIndex(initialIndex);
   }, [initialIndex, scrollToTab]);

   // Handle tab press
   const handleTabPress = useCallback((index: number) => {
      if (index === currentIndex) return;

      isUserScrolling.current = false;
      scrollToTab(index, true);
      setCurrentIndex(index);
      onIndexChange?.(index);
   }, [currentIndex, onIndexChange, scrollToTab]);

   // Update index from scroll
   const updateIndex = useCallback((newIndex: number) => {
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < routes.length) {
         setCurrentIndex(newIndex);
         onIndexChange?.(newIndex);
      }
   }, [currentIndex, onIndexChange, routes.length]);

   // Enhanced scroll handler
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

   // Enhanced animated indicator style
   const animatedIndicatorStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
         scrollX.value,
         routes.map((_, i) => i * screenWidth),
         routes.map((_, i) => i * tabWidth),
         Extrapolate.CLAMP,
      );

      return {
         transform: [{ translateX }],
         width: tabWidth,
      };
   });

   // Enhanced tab animation
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
            opacity: withTiming(opacity, { duration: 200 }),
            transform: [{ scale: withTiming(scale, { duration: 200 }) }],
         };
      });
   }, [scrollX]);

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
      >
         <ScrollView
            ref={tabScrollViewRef}
            horizontal
            scrollEnabled={scrollEnabled && routes.length > 4}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
               paddingHorizontal: 0,
               flexGrow: 1,
            }}
         >
            <HStack
               space={0}
               style={{
                  width: routes.length <= 4 ? screenWidth - 32 : routes.length * tabWidth,
                  justifyContent: routes.length <= 4 ? 'space-between' : 'flex-start',
               }}
            >
               {routes.map((route, index) => {
                  const isActive = currentIndex === index;
                  const animatedStyle = getTabAnimatedStyle(index);

                  return (
                     <Box
                        key={route.key}
                        onPress={() => handleTabPress(index)}
                        style={[
                           {
                              width: tabWidth,
                              paddingVertical: 12,
                              paddingHorizontal: 8,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: showIndicator ? 0 : 12,
                              marginHorizontal: showIndicator ? 0 : 2,
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
            </HStack>

            {/* Enhanced Indicator - only show if showIndicator is true */}
            {showIndicator && (
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
                     animatedIndicatorStyle,
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