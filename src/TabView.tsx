import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ScrollView, Dimensions, ViewStyle } from 'react-native';
import Animated, {
   useSharedValue,
   useAnimatedStyle,
   useAnimatedScrollHandler,
   withTiming,
   runOnJS,
   interpolate,
   Extrapolate,
} from 'react-native-reanimated';
import { Box, Text } from './components';
import { useColorMode } from './hooks/useColorMode';
import { FontStyles, SCREEN_WIDTH } from './constants';
import { TabViewProps, TabRoute } from './types';

const { width: screenWidth } = Dimensions.get('window');

// Helper function to get the correct scroll position for RTL
const getScrollPosition = (index: number, isRTL: boolean, totalRoutes: number) => {
   if (isRTL) {
      // For RTL, reverse the index
      const reversedIndex = totalRoutes - 1 - index;
      return reversedIndex * screenWidth;
   }
   return index * screenWidth;
};

// Helper function to calculate tab bar scroll position
const calculateTabBarScrollX = (index: number, totalTabs: number, screenWidth: number, isRTL: boolean, tabWidth: number) => {
   if (isRTL) {
      // For RTL, we need to scroll in the opposite direction
      const reversedIndex = totalTabs - 1 - index;
      const tabBarScrollX = reversedIndex * tabWidth - screenWidth / 2 + tabWidth / 2;
      return Math.max(0, tabBarScrollX);
   } else {
      // For LTR, calculate from the left side
      const tabBarScrollX = index * tabWidth - screenWidth / 2 + tabWidth / 2;
      return Math.max(0, tabBarScrollX);
   }
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
   showIndicator = true,
}) => {
   const [currentIndex, setCurrentIndex] = useState(initialIndex);
   const scrollViewRef = useRef<Animated.ScrollView>(null);
   const tabScrollViewRef = useRef<ScrollView>(null);
   const isUserScrolling = useRef(false);

   const scrollX = useSharedValue(getScrollPosition(initialIndex, isRTL, routes.length));
   const { colorMode } = useColorMode();

   // Calculate tab width
   const tabWidth = useMemo(() => {
      if (tabBarWidthDivider) {
         return screenWidth / tabBarWidthDivider;
      }

      if (routes.length <= 3) {
         return (screenWidth - 32) / routes.length;
      }

      return Math.max(120, screenWidth / 4);
   }, [routes.length, tabBarWidthDivider]);

   // Update index when scrolling
   const updateIndexFromScroll = useCallback((newIndex: number) => {
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < routes.length) {
         setCurrentIndex(newIndex);
         onIndexChange?.(newIndex);

         // Auto-scroll tab bar
         if (tabScrollViewRef.current && routes.length > 3) {
            setTimeout(() => {
               const tabBarScrollX = calculateTabBarScrollX(newIndex, routes.length, screenWidth, isRTL, tabWidth);
               tabScrollViewRef.current?.scrollTo({
                  x: tabBarScrollX,
                  animated: true,
               });
            }, 100);
         }
      }
   }, [currentIndex, onIndexChange, routes.length, isRTL, tabWidth]);

   // Handle tab press
   const handleTabPress = useCallback((index: number) => {
      if (index === currentIndex) return;

      isUserScrolling.current = false;
      const targetX = getScrollPosition(index, isRTL, routes.length);

      scrollX.value = withTiming(targetX, { duration: 350 });

      if (scrollViewRef.current) {
         scrollViewRef.current.scrollTo({
            x: targetX,
            animated: true,
         });
      }

      setCurrentIndex(index);
      onIndexChange?.(index);

      // Auto-scroll tab bar
      if (tabScrollViewRef.current && routes.length > 3) {
         setTimeout(() => {
            const tabBarScrollX = calculateTabBarScrollX(index, routes.length, screenWidth, isRTL, tabWidth);
            tabScrollViewRef.current?.scrollTo({
               x: tabBarScrollX,
               animated: true,
            });
         }, 100);
      }
   }, [currentIndex, onIndexChange, scrollX, isRTL, routes.length, tabWidth]);

   // Initialize
   useEffect(() => {
      const targetX = getScrollPosition(initialIndex, isRTL, routes.length);
      scrollX.value = withTiming(targetX, { duration: 350 });

      if (scrollViewRef.current) {
         scrollViewRef.current.scrollTo({
            x: targetX,
            animated: true,
         });
      }

      setCurrentIndex(initialIndex);

      // Auto-scroll tab bar
      if (tabScrollViewRef.current && routes.length > 3) {
         setTimeout(() => {
            const tabBarScrollX = calculateTabBarScrollX(initialIndex, routes.length, screenWidth, isRTL, tabWidth);
            tabScrollViewRef.current?.scrollTo({
               x: tabBarScrollX,
               animated: true,
            });
         }, 150);
      }
   }, [initialIndex, isRTL, routes.length, scrollX, tabWidth]);

   // Scroll handler
   const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
         scrollX.value = event.contentOffset.x;

         if (isUserScrolling.current) {
            const progress = event.contentOffset.x / screenWidth;
            let newIndex;

            if (isRTL) {
               // For RTL, reverse the calculation
               const scrollIndex = Math.floor(progress + 0.2);
               newIndex = routes.length - 1 - scrollIndex;
            } else {
               newIndex = Math.floor(progress + 0.2);
            }

            const clampedIndex = Math.max(0, Math.min(newIndex, routes.length - 1));
            runOnJS(updateIndexFromScroll)(clampedIndex);
         }
      },
      onBeginDrag: () => {
         isUserScrolling.current = true;
      },
      onEndDrag: () => {
         isUserScrolling.current = false;
      },
   });

   // Handle scroll end
   const handleScrollEnd = useCallback((event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const rawIndex = Math.round(offsetX / screenWidth);
      const newIndex = isRTL ? routes.length - 1 - rawIndex : rawIndex;

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < routes.length) {
         setCurrentIndex(newIndex);
         onIndexChange?.(newIndex);

         // Auto-scroll tab bar
         if (tabScrollViewRef.current && routes.length > 3) {
            setTimeout(() => {
               const tabBarScrollX = calculateTabBarScrollX(newIndex, routes.length, screenWidth, isRTL, tabWidth);
               tabScrollViewRef.current?.scrollTo({
                  x: tabBarScrollX,
                  animated: true,
               });
            }, 100);
         }
      }
      isUserScrolling.current = false;
   }, [currentIndex, onIndexChange, routes.length, isRTL, tabWidth]);

   // Animated indicator style that follows scroll position
   const indicatorAnimatedStyle = useAnimatedStyle(() => {
      const progress = scrollX.value / screenWidth;
      let translateX;

      if (isRTL) {
         // For RTL with row-reverse layout:
         // When at first tab (index 0), scroll position is at (routes.length - 1) * screenWidth
         // The indicator should be at the rightmost position (index 0 in reversed layout)
         const currentScrollIndex = progress;
         const logicalIndex = routes.length - 1 - currentScrollIndex;
         // In row-reverse, the first item (index 0) is on the right
         translateX = (routes.length - 1 - logicalIndex) * tabWidth;
      } else {
         // For LTR, normal calculation
         translateX = progress * tabWidth;
      }

      return {
         transform: [{ translateX }],
      };
   });

   // Static indicator style
   const indicatorBaseStyle = useMemo(() => {
      return {
         position: 'absolute' as const,
         bottom: 4,
         left: 0,
         height: 3,
         width: tabWidth,
         backgroundColor: '#007AFF',
         borderRadius: 2,
      };
   }, [tabWidth]);

   // Tab animation
   const getTabAnimatedStyle = useCallback((index: number) => {
      return useAnimatedStyle(() => {
         let inputRange;

         if (isRTL) {
            const reversedIndex = routes.length - 1 - index;
            inputRange = [
               (reversedIndex - 1) * screenWidth,
               reversedIndex * screenWidth,
               (reversedIndex + 1) * screenWidth,
            ];
         } else {
            inputRange = [
               (index - 1) * screenWidth,
               index * screenWidth,
               (index + 1) * screenWidth,
            ];
         }

         const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.6, 1, 0.6],
            Extrapolate.CLAMP,
         );

         return { opacity };
      });
   }, [scrollX, isRTL, routes.length]);

   // Render routes in RTL order if needed
   const orderedRoutes = useMemo(() => {
      if (isRTL) {
         return [...routes].reverse();
      }
      return routes;
   }, [routes, isRTL]);

   // Render tab bar
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
               flexDirection: isRTL ? 'row-reverse' : 'row',
               justifyContent: routes.length <= 3 ? 'space-around' : 'flex-start',
               minWidth: routes.length <= 3 ? screenWidth - 32 : undefined,
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
                           marginHorizontal: showIndicator ? 0 : (isRTL && scrollEnabled ? 6 : 4),
                           backgroundColor: showIndicator
                              ? 'transparent'
                              : (isActive
                                 ? '#007AFF'
                                 : 'transparent'),
                        },
                        isActive ? activeTabStyle : tabStyle,
                     ]}
                  >
                     <Animated.View style={[{ alignItems: 'center' }, animatedStyle]}>
                        <Text
                           color={showIndicator
                              ? (isActive
                                 ? '#007AFF'
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
                           style={isActive ? activeLabelStyle : labelStyle}
                        >
                           {route.title}
                        </Text>
                     </Animated.View>
                  </Box>
               );
            })}

            {/* Animated Indicator */}
            {showIndicator && (
               <Animated.View
                  style={[
                     indicatorBaseStyle,
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

         <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            bounces={false}
            onMomentumScrollEnd={handleScrollEnd}
            decelerationRate="fast"
            snapToInterval={screenWidth}
            snapToAlignment="center"
            contentContainerStyle={{
               width: screenWidth * routes.length,
            }}
            style={{ flex: 1 }}
         >
            {orderedRoutes.map((route, scrollIndex) => {
               // Get the actual route index for isActive check
               const actualIndex = isRTL ? routes.length - 1 - scrollIndex : scrollIndex;
               const isActive = currentIndex === actualIndex;

               return (
                  <Box
                     key={route.key}
                     width={screenWidth}
                     style={{
                        backgroundColor: colorMode === 'dark' ? '#000000' : '#ffffff',
                     }}
                  >
                     {renderScene({ route, index: actualIndex, isActive })}
                  </Box>
               );
            })}
         </Animated.ScrollView>
      </Box>
   );
};

export default TabView;