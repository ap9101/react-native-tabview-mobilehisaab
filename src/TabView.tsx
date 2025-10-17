import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ScrollView, Dimensions } from 'react-native';
import Animated, {
   useSharedValue,
   useAnimatedStyle,
   useAnimatedScrollHandler,
   withTiming,
   runOnJS,
   interpolate,
   Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Box, HStack, Text } from './components';
import { useColorMode } from './hooks/useColorMode';
import { FontStyles, SCREEN_WIDTH } from './constants';
import { TabViewProps, TabRoute } from './types';

// Helper function to calculate tab bar scroll position
const calculateTabBarScrollX = (index: number, totalTabs: number, screenWidth: number, isRTL: boolean) => {
   const estimatedTabWidth = Math.max(100, screenWidth / 4);

   if (isRTL) {
      // For RTL, we need to scroll in the opposite direction
      // When moving to higher indices (right in content), scroll left in tab bar
      const reversedIndex = totalTabs - 1 - index;
      const tabBarScrollX = reversedIndex * estimatedTabWidth - screenWidth / 2 + estimatedTabWidth / 2;
      return Math.max(0, tabBarScrollX);
   } else {
      // For LTR, calculate from the left side
      const tabBarScrollX = index * estimatedTabWidth - screenWidth / 2 + estimatedTabWidth / 2;
      return Math.max(0, tabBarScrollX);
   }
};

// Helper function to get the correct scroll position for RTL
const getScrollPosition = (index: number, isRTL: boolean, totalRoutes: number) => {
   if (isRTL) {
      // For RTL, reverse the index
      const reversedIndex = totalRoutes - 1 - index;
      return reversedIndex * SCREEN_WIDTH;
   }
   return index * SCREEN_WIDTH;
};

// Helper function to get index from scroll position
const getIndexFromScroll = (scrollX: number, isRTL: boolean, totalRoutes: number) => {
   const rawIndex = Math.round(scrollX / SCREEN_WIDTH);

   if (isRTL) {
      // For RTL, reverse the index
      return totalRoutes - 1 - rawIndex;
   }
   return rawIndex;
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
   const hasScrolledToInitial = useRef(false);

   const scrollX = useSharedValue(getScrollPosition(initialIndex, isRTL, routes.length));
   const isScrolling = useSharedValue(false);
   const { colorMode } = useColorMode();
   const memoizedRoutes = useMemo(() => routes, [routes]);

   // Memoize RTL-aware calculations
   const rtlConfig = useMemo(() => ({
      isRTL,
      totalRoutes: memoizedRoutes.length,
   }), [isRTL, memoizedRoutes.length]);

   /** 🧩 Scroll to initial position smoothly when mounted or when prop changes **/
   useEffect(() => {
      const targetX = getScrollPosition(initialIndex, isRTL, memoizedRoutes.length);

      if (scrollViewRef.current) {
         scrollX.value = withTiming(targetX, { duration: 350 });
         scrollViewRef.current.scrollTo({
            x: targetX,
            animated: true,
         });
      }

      setCurrentIndex(initialIndex);

      // Auto-scroll tab bar to keep active tab visible
      if (tabScrollViewRef.current) {
         setTimeout(() => {
            const tabBarScrollX = calculateTabBarScrollX(initialIndex, memoizedRoutes.length, SCREEN_WIDTH, isRTL);
            tabScrollViewRef.current?.scrollTo({
               x: tabBarScrollX,
               animated: true,
            });
         }, 150);
      }
   }, [initialIndex, memoizedRoutes.length, isRTL]);

   /** 🌀 Update index when scroll changes **/
   const updateIndexFromScroll = useCallback(
      (newIndex: number) => {
         if (newIndex !== currentIndex && newIndex >= 0 && newIndex < memoizedRoutes.length) {
            setCurrentIndex(newIndex);
            onIndexChange?.(newIndex);

            // Auto-scroll tab bar to keep active tab visible
            if (tabScrollViewRef.current) {
               setTimeout(() => {
                  const tabBarScrollX = calculateTabBarScrollX(newIndex, memoizedRoutes.length, SCREEN_WIDTH, isRTL);
                  tabScrollViewRef.current?.scrollTo({
                     x: tabBarScrollX,
                     animated: true,
                  });
               }, 100);
            }
         }
      },
      [currentIndex, onIndexChange, memoizedRoutes.length, isRTL],
   );

   /** 🖱️ Handle tab press **/
   const handleTabPress = useCallback(
      (index: number) => {
         if (index === currentIndex) return;

         isUserScrolling.current = false;
         const targetX = getScrollPosition(index, isRTL, memoizedRoutes.length);

         // Animate both native scroll and shared value
         scrollX.value = withTiming(targetX, { duration: 350 });
         scrollViewRef.current?.scrollTo({ x: targetX, animated: true });

         setCurrentIndex(index);
         onIndexChange?.(index);

         // Auto-scroll tab bar to keep active tab visible
         if (tabScrollViewRef.current) {
            setTimeout(() => {
               const tabBarScrollX = calculateTabBarScrollX(index, memoizedRoutes.length, SCREEN_WIDTH, isRTL);
               tabScrollViewRef.current?.scrollTo({
                  x: tabBarScrollX,
                  animated: true,
               });
            }, 100);
         }
      },
      [currentIndex, onIndexChange, memoizedRoutes.length, isRTL],
   );

   /** 🧮 Scroll handler **/
   const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event: any) => {
         scrollX.value = event.contentOffset.x;

         if (isUserScrolling.current) {
            const progress = event.contentOffset.x / SCREEN_WIDTH;
            let newIndex;

            if (rtlConfig.isRTL) {
               // For RTL, reverse the calculation
               const scrollIndex = Math.floor(progress + 0.2);
               newIndex = rtlConfig.totalRoutes - 1 - scrollIndex;
            } else {
               newIndex = Math.floor(progress + 0.2);
            }

            const clampedIndex = Math.max(0, Math.min(newIndex, rtlConfig.totalRoutes - 1));
            runOnJS(updateIndexFromScroll)(clampedIndex);
         }
      },
      onBeginDrag: () => {
         isScrolling.value = true;
         isUserScrolling.current = true;
      },
      onEndDrag: () => {
         isScrolling.value = false;
      },
   });

   /** 🎯 Scroll end handler **/
   const handleScrollEnd = useCallback(
      (event: any) => {
         const offsetX = event.nativeEvent.contentOffset.x;
         const newIndex = getIndexFromScroll(offsetX, isRTL, memoizedRoutes.length);

         if (newIndex !== currentIndex && newIndex >= 0 && newIndex < memoizedRoutes.length) {
            setCurrentIndex(newIndex);
            onIndexChange?.(newIndex);

            // Auto-scroll tab bar to keep active tab visible
            if (tabScrollViewRef.current) {
               setTimeout(() => {
                  const tabBarScrollX = calculateTabBarScrollX(newIndex, memoizedRoutes.length, SCREEN_WIDTH, isRTL);
                  tabScrollViewRef.current?.scrollTo({
                     x: tabBarScrollX,
                     animated: true,
                  });
               }, 100);
            }
         }
         isUserScrolling.current = false;
      },
      [currentIndex, onIndexChange, memoizedRoutes.length, isRTL],
   );

   /** 👆 Pan gesture for smooth control **/
   const panGesture = Gesture.Pan()
      .onStart(() => {
         isScrolling.value = true;
      })
      .onEnd(() => {
         isScrolling.value = false;
      });

   /** 🔹 Animated underline indicator **/
   const animatedIndicatorStyle = useAnimatedStyle(() => {
      let translateX;

      if (isRTL) {
         // For RTL, reverse the interpolation
         const inputRange = memoizedRoutes.map((_, i) => {
            const reversedIndex = memoizedRoutes.length - 1 - i;
            return reversedIndex * SCREEN_WIDTH;
         });

         const outputRange = memoizedRoutes.map((_, i) => i * (SCREEN_WIDTH / memoizedRoutes.length));

         translateX = interpolate(
            scrollX.value,
            inputRange,
            outputRange,
            Extrapolate.CLAMP,
         );
      } else {
         // For LTR, normal interpolation
         translateX = interpolate(
            scrollX.value,
            memoizedRoutes.map((_, i) => i * SCREEN_WIDTH),
            memoizedRoutes.map((_, i) => i * (SCREEN_WIDTH / memoizedRoutes.length)),
            Extrapolate.CLAMP,
         );
      }

      return {
         transform: [{ translateX }],
      };
   });

   /** 🧭 Render Tab Bar **/
   const renderTabBar = () => (
      <Box style={tabBarStyle} backgroundColor="transparent" paddingHorizontal={4} paddingVertical={3}>
         <ScrollView
            ref={scrollEnabled ? tabScrollViewRef : null}
            horizontal
            scrollEnabled={scrollEnabled}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
               paddingHorizontal: 0,
               flexDirection: isRTL && scrollEnabled ? 'row-reverse' : 'row',
               flexGrow: scrollEnabled ? 1 : 0,
               justifyContent: isRTL ? 'flex-end' : 'flex-start',
            }}
         >
            <HStack space={tabBarWidthDivider ? 0 : 3} reversed={isRTL} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
               {memoizedRoutes.map((route, index) => {
                  const isActive = currentIndex === index;

                  const animatedTextStyle = useAnimatedStyle(() => {
                     let opacity;

                     if (isRTL) {
                        const reversedIndex = memoizedRoutes.length - 1 - index;
                        const inputRange = [
                           (reversedIndex - 1) * SCREEN_WIDTH,
                           reversedIndex * SCREEN_WIDTH,
                           (reversedIndex + 1) * SCREEN_WIDTH,
                        ];
                        opacity = interpolate(scrollX.value, inputRange, [1, 0.4, 1], Extrapolate.CLAMP);
                     } else {
                        const inputRange = [
                           (index - 1) * SCREEN_WIDTH,
                           index * SCREEN_WIDTH,
                           (index + 1) * SCREEN_WIDTH,
                        ];
                        opacity = interpolate(scrollX.value, inputRange, [1, 0.4, 1], Extrapolate.CLAMP);
                     }

                     return { opacity: withTiming(isActive ? 1 : opacity, { duration: 200 }) };
                  });

                  return (
                     <Box
                        key={route.key}
                        onPress={() => handleTabPress(index)}
                        backgroundColor={isActive ? (settingTab && colorMode === 'dark') ? 'white' : 'activeTabBackground' : 'transparent'}
                        paddingVertical={1}
                        paddingHorizontal={2}
                        borderRadius={4}
                        alignItems="center"
                        justifyContent="center"
                        style={[
                           { marginHorizontal: isRTL && scrollEnabled ? 6 : 0 },
                           isActive ? activeTabStyle : tabStyle,
                           tabBarWidthDivider ? { width: SCREEN_WIDTH / tabBarWidthDivider } : undefined
                        ]}
                     >
                        <Animated.View style={animatedTextStyle}>
                           <Text
                              color={isActive ? 'activeTabText' : 'textInactiveTab'}
                              fontSize={14}
                              allowFontScaling={false}
                              fontWeight="500"
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
            </HStack>
            {indicatorStyle && (
               <Animated.View
                  style={[
                     {
                        height: 2,
                        backgroundColor: 'activeTabText',
                        width: SCREEN_WIDTH / memoizedRoutes.length,
                        borderRadius: 2,
                     },
                     animatedIndicatorStyle,
                     indicatorStyle,
                  ]}
               />
            )}
         </ScrollView>
      </Box>
   );

   // Render routes in RTL order if needed
   const orderedRoutes = useMemo(() => {
      if (isRTL) {
         return [...memoizedRoutes].reverse();
      }
      return memoizedRoutes;
   }, [memoizedRoutes, isRTL]);

   return (
      <Box flex={1}>
         {renderTabBar()}

         <GestureDetector gesture={panGesture}>
            <Animated.ScrollView
               ref={scrollViewRef}
               horizontal
               pagingEnabled
               scrollEventThrottle={8}
               showsHorizontalScrollIndicator={false}
               onScroll={scrollHandler}
               bounces={false}
               onMomentumScrollEnd={handleScrollEnd}
               decelerationRate="fast"
               snapToInterval={SCREEN_WIDTH}
               snapToAlignment="center"
               removeClippedSubviews={true}
               contentContainerStyle={{
                  width: SCREEN_WIDTH * memoizedRoutes.length,
               }}
            >
               {orderedRoutes.map((route, scrollIndex) => {
                  // Get the actual route index for isActive check
                  const actualIndex = isRTL ? memoizedRoutes.length - 1 - scrollIndex : scrollIndex;
                  const isActive = currentIndex === actualIndex;

                  return (
                     <Box key={route.key} width={SCREEN_WIDTH}>
                        {renderScene({ route, index: actualIndex, isActive })}
                     </Box>
                  );
               })}
            </Animated.ScrollView>
         </GestureDetector>
      </Box>
   );
};

export default TabView;
