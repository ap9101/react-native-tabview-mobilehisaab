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

   const scrollX = useSharedValue(initialIndex * screenWidth);
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
   const updateIndex = useCallback((newIndex: number) => {
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < routes.length) {
         setCurrentIndex(newIndex);
         onIndexChange?.(newIndex);

         // Auto-scroll tab bar
         if (tabScrollViewRef.current && routes.length > 3) {
            const targetX = newIndex * tabWidth - screenWidth / 2 + tabWidth / 2;
            tabScrollViewRef.current.scrollTo({
               x: Math.max(0, targetX),
               animated: true,
            });
         }
      }
   }, [currentIndex, onIndexChange, routes.length, tabWidth]);

   // Handle tab press
   const handleTabPress = useCallback((index: number) => {
      if (index === currentIndex) return;

      const targetX = index * screenWidth;
      scrollX.value = withTiming(targetX, { duration: 300 });

      if (scrollViewRef.current) {
         scrollViewRef.current.scrollTo({
            x: targetX,
            animated: true,
         });
      }

      setCurrentIndex(index);
      onIndexChange?.(index);
   }, [currentIndex, onIndexChange, scrollX]);

   // Initialize
   useEffect(() => {
      const targetX = initialIndex * screenWidth;
      scrollX.value = targetX;

      if (scrollViewRef.current) {
         scrollViewRef.current.scrollTo({
            x: targetX,
            animated: false,
         });
      }

      setCurrentIndex(initialIndex);
   }, [initialIndex, scrollX]);

   // Scroll handler
   const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
         scrollX.value = event.contentOffset.x;
      },
      onMomentumEnd: (event) => {
         const newIndex = Math.round(event.contentOffset.x / screenWidth);
         const clampedIndex = Math.max(0, Math.min(newIndex, routes.length - 1));
         runOnJS(updateIndex)(clampedIndex);
      },
   });

   // Animated indicator style that follows scroll position
   const indicatorAnimatedStyle = useAnimatedStyle(() => {
      // Calculate the indicator position based on scroll position
      const progress = scrollX.value / screenWidth;
      const translateX = progress * tabWidth;

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

         return { opacity };
      });
   }, [scrollX]);

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
               flexDirection: 'row',
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
                           marginHorizontal: showIndicator ? 0 : 4,
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
                     indicatorStyle, // User's custom indicator style from props
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
            decelerationRate="fast"
            snapToInterval={screenWidth}
            snapToAlignment="center"
            contentContainerStyle={{
               width: screenWidth * routes.length,
            }}
            style={{ flex: 1 }}
         >
            {routes.map((route, index) => (
               <Box
                  key={route.key}
                  width={screenWidth}
                  style={{
                     backgroundColor: colorMode === 'dark' ? '#000000' : '#ffffff',
                  }}
               >
                  {renderScene({ route, index, isActive: currentIndex === index })}
               </Box>
            ))}
         </Animated.ScrollView>
      </Box>
   );
};

export default TabView;