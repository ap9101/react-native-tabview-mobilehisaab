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

// Enhanced helper function to calculate tab width
const calculateTabWidth = (totalTabs: number, screenWidth: number, minTabWidth = 120) => {
   const availableWidth = screenWidth - 32; // Account for padding
   const calculatedWidth = availableWidth / totalTabs;
   return Math.max(calculatedWidth, minTabWidth);
};

// Helper function to calculate tab bar scroll position
const calculateTabBarScrollX = (index: number, totalTabs: number, screenWidth: number, tabWidth: number) => {
   const targetX = index * tabWidth - screenWidth / 2 + tabWidth / 2;
   return Math.max(0, targetX);
};

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
}) => {
   const [currentIndex, setCurrentIndex] = useState(initialIndex);
   const scrollViewRef = useRef<Animated.ScrollView>(null);
   const tabScrollViewRef = useRef<ScrollView>(null);
   const isUserScrolling = useRef(false);

   const scrollX = useSharedValue(initialIndex * screenWidth);
   const tabWidth = calculateTabWidth(routes.length, screenWidth);
   const { colorMode } = useColorMode();

   // Enhanced scroll to tab function
   const scrollToTab = useCallback((index: number, animated = true) => {
      const targetX = index * screenWidth;

      if (scrollViewRef.current) {
         scrollViewRef.current.scrollTo({
            x: targetX,
            animated,
         });
      }

      // Scroll tab bar to keep active tab visible
      if (tabScrollViewRef.current && routes.length > 3) {
         const tabBarScrollX = calculateTabBarScrollX(index, routes.length, screenWidth, tabWidth);
         setTimeout(() => {
            tabScrollViewRef.current?.scrollTo({
               x: tabBarScrollX,
               animated: true,
            });
         }, animated ? 100 : 0);
      }
   }, [routes.length, tabWidth]);

   // Initialize position
   useEffect(() => {
      scrollToTab(initialIndex, false);
      setCurrentIndex(initialIndex);
   }, [initialIndex, scrollToTab]);

   // Handle tab press
   const handleTabPress = useCallback((index: number) => {
      if (index === currentIndex) return;

      isUserScrolling.current = false;
      scrollX.value = withSpring(index * screenWidth, {
         damping: 20,
         stiffness: 300,
      });

      scrollToTab(index, true);
      setCurrentIndex(index);
      onIndexChange?.(index);
   }, [currentIndex, onIndexChange, scrollToTab, scrollX]);

   // Enhanced scroll handler
   const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
         scrollX.value = event.contentOffset.x;

         if (isUserScrolling.current) {
            const newIndex = Math.round(event.contentOffset.x / screenWidth);
            const clampedIndex = Math.max(0, Math.min(newIndex, routes.length - 1));

            if (clampedIndex !== currentIndex) {
               runOnJS(setCurrentIndex)(clampedIndex);
               if (onIndexChange) {
                  runOnJS(onIndexChange)(clampedIndex);
               }
            }
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
            [0.9, 1, 0.9],
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
            scrollEnabled={scrollEnabled && routes.length > 3}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
               paddingHorizontal: 0,
               minWidth: screenWidth - 32,
            }}
         >
            <HStack space={0} style={{ width: '100%' }}>
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
                              borderRadius: 12,
                              marginHorizontal: 2,
                              backgroundColor: isActive
                                 ? (colorMode === 'dark' ? '#007AFF' : '#007AFF')
                                 : 'transparent',
                           },
                           isActive ? activeTabStyle : tabStyle,
                        ]}
                     >
                        <Animated.View style={[{ alignItems: 'center' }, animatedStyle]}>
                           <Text
                              color={isActive
                                 ? '#ffffff'
                                 : (colorMode === 'dark' ? '#ffffff' : '#666666')
                              }
                              fontSize={16}
                              fontWeight={isActive ? '600' : '500'}
                              fontFamily={FontStyles.interMedium.fontFamily}
                              textAlign="center"
                              numberOfLines={1}
                              style={[
                                 {
                                    textShadowColor: isActive ? 'rgba(0,0,0,0.1)' : 'transparent',
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

            {/* Enhanced Indicator */}
            <Animated.View
               style={[
                  {
                     position: 'absolute',
                     bottom: 4,
                     height: 3,
                     backgroundColor: '#007AFF',
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
                  const isActive = Math.abs(currentIndex - index) <= 1; // Render adjacent tabs for smooth scrolling

                  return (
                     <Box
                        key={route.key}
                        width={screenWidth}
                        style={{
                           backgroundColor: colorMode === 'dark' ? '#000000' : '#ffffff',
                        }}
                     >
                        {isActive && renderScene({ route, index, isActive: currentIndex === index })}
                     </Box>
                  );
               })}
            </Animated.ScrollView>
         </GestureDetector>
      </Box>
   );
};

export default TabView;