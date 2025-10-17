import React, { useState } from 'react';
import {
   SafeAreaView,
   StyleSheet,
   View,
   Text,
   ScrollView,
   TouchableOpacity,
   StatusBar,
} from 'react-native';
import { TabView } from '@mobilehisaab/react-native-tabview';

const App = () => {
   const [currentIndex, setCurrentIndex] = useState(0);

   // Basic example routes
   const basicRoutes = [
      { key: 'home', title: 'Home' },
      { key: 'search', title: 'Search' },
      { key: 'profile', title: 'Profile' },
      { key: 'settings', title: 'Settings' },
   ];

   // RTL example routes
   const rtlRoutes = [
      { key: 'first', title: 'الأول' },
      { key: 'second', title: 'الثاني' },
      { key: 'third', title: 'الثالث' },
      { key: 'fourth', title: 'الرابع' },
   ];

   // Custom styled routes
   const customRoutes = [
      { key: 'tab1', title: 'Tab 1' },
      { key: 'tab2', title: 'Tab 2' },
      { key: 'tab3', title: 'Tab 3' },
   ];

   const renderBasicScene = ({ route, index, isActive }) => (
      <View style={styles.scene}>
         <Text style={styles.sceneTitle}>{route.title} Tab</Text>
         <Text style={styles.sceneSubtitle}>Index: {index}</Text>
         <Text style={styles.sceneSubtitle}>Active: {isActive ? 'Yes' : 'No'}</Text>
         <View style={styles.contentBox}>
            <Text style={styles.contentText}>
               This is the content for {route.title} tab. You can put any React Native components here.
            </Text>
         </View>
      </View>
   );

   const renderRTLScene = ({ route, index, isActive }) => (
      <View style={styles.scene}>
         <Text style={[styles.sceneTitle, { textAlign: 'right' }]}>
            {route.title} تبويب
         </Text>
         <Text style={[styles.sceneSubtitle, { textAlign: 'right' }]}>
            الفهرس: {index}
         </Text>
         <Text style={[styles.sceneSubtitle, { textAlign: 'right' }]}>
            نشط: {isActive ? 'نعم' : 'لا'}
         </Text>
         <View style={styles.contentBox}>
            <Text style={[styles.contentText, { textAlign: 'right' }]}>
               هذا هو المحتوى لتبويب {route.title}. يمكنك وضع أي مكونات React Native هنا.
            </Text>
         </View>
      </View>
   );

   const renderCustomScene = ({ route, index, isActive }) => (
      <View style={[styles.scene, { backgroundColor: isActive ? '#e3f2fd' : '#f5f5f5' }]}>
         <Text style={[styles.sceneTitle, { color: isActive ? '#1976d2' : '#666' }]}>
            {route.title}
         </Text>
         <View style={[styles.contentBox, { backgroundColor: isActive ? '#bbdefb' : '#e0e0e0' }]}>
            <Text style={styles.contentText}>
               Custom styled tab with conditional styling based on active state.
            </Text>
         </View>
      </View>
   );

   const [exampleType, setExampleType] = useState('basic');

   const renderExample = () => {
      switch (exampleType) {
         case 'basic':
            return (
               <TabView
                  routes={basicRoutes}
                  renderScene={renderBasicScene}
                  initialIndex={0}
                  onIndexChange={setCurrentIndex}
               />
            );
         case 'rtl':
            return (
               <TabView
                  routes={rtlRoutes}
                  renderScene={renderRTLScene}
                  initialIndex={0}
                  onIndexChange={setCurrentIndex}
                  isRTL={true}
               />
            );
         case 'custom':
            return (
               <TabView
                  routes={customRoutes}
                  renderScene={renderCustomScene}
                  initialIndex={0}
                  onIndexChange={setCurrentIndex}
                  tabBarStyle={styles.customTabBar}
                  activeTabStyle={styles.customActiveTab}
                  activeLabelStyle={styles.customActiveLabel}
                  indicatorStyle={styles.customIndicator}
               />
            );
         case 'fixed':
            return (
               <TabView
                  routes={customRoutes}
                  renderScene={renderCustomScene}
                  initialIndex={0}
                  onIndexChange={setCurrentIndex}
                  tabBarWidthDivider={3}
                  scrollEnabled={false}
                  tabBarStyle={styles.fixedTabBar}
               />
            );
         default:
            return null;
      }
   };

   return (
      <SafeAreaView style={styles.container}>
         <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

         <View style={styles.header}>
            <Text style={styles.headerTitle}>TabView Examples</Text>
            <Text style={styles.headerSubtitle}>@mobilehisaab/react-native-tabview</Text>
         </View>

         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exampleSelector}>
            {[
               { key: 'basic', title: 'Basic' },
               { key: 'rtl', title: 'RTL' },
               { key: 'custom', title: 'Custom' },
               { key: 'fixed', title: 'Fixed Width' },
            ].map((example) => (
               <TouchableOpacity
                  key={example.key}
                  style={[
                     styles.exampleButton,
                     exampleType === example.key && styles.exampleButtonActive,
                  ]}
                  onPress={() => setExampleType(example.key)}
               >
                  <Text
                     style={[
                        styles.exampleButtonText,
                        exampleType === example.key && styles.exampleButtonTextActive,
                     ]}
                  >
                     {example.title}
                  </Text>
               </TouchableOpacity>
            ))}
         </ScrollView>

         <View style={styles.tabContainer}>
            {renderExample()}
         </View>

         <View style={styles.footer}>
            <Text style={styles.footerText}>
               Current Tab: {currentIndex} | Example: {exampleType}
            </Text>
         </View>
      </SafeAreaView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#f8f9fa',
   },
   header: {
      padding: 20,
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: '#e9ecef',
   },
   headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#212529',
      marginBottom: 4,
   },
   headerSubtitle: {
      fontSize: 14,
      color: '#6c757d',
   },
   exampleSelector: {
      backgroundColor: '#ffffff',
      paddingVertical: 10,
      paddingHorizontal: 20,
   },
   exampleButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 10,
      borderRadius: 20,
      backgroundColor: '#e9ecef',
   },
   exampleButtonActive: {
      backgroundColor: '#007bff',
   },
   exampleButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#495057',
   },
   exampleButtonTextActive: {
      color: '#ffffff',
   },
   tabContainer: {
      flex: 1,
   },
   scene: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
   },
   sceneTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#212529',
      marginBottom: 8,
   },
   sceneSubtitle: {
      fontSize: 16,
      color: '#6c757d',
      marginBottom: 4,
   },
   contentBox: {
      marginTop: 20,
      padding: 20,
      borderRadius: 8,
      backgroundColor: '#ffffff',
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
   },
   contentText: {
      fontSize: 16,
      color: '#495057',
      textAlign: 'center',
      lineHeight: 24,
   },
   customTabBar: {
      backgroundColor: '#2c3e50',
      paddingVertical: 10,
   },
   customActiveTab: {
      backgroundColor: '#3498db',
      borderRadius: 20,
   },
   customActiveLabel: {
      color: '#ffffff',
      fontWeight: 'bold',
   },
   customIndicator: {
      backgroundColor: '#e74c3c',
      height: 3,
   },
   fixedTabBar: {
      backgroundColor: '#f8f9fa',
      borderBottomWidth: 1,
      borderBottomColor: '#dee2e6',
   },
   footer: {
      padding: 16,
      backgroundColor: '#ffffff',
      borderTopWidth: 1,
      borderTopColor: '#e9ecef',
   },
   footerText: {
      fontSize: 12,
      color: '#6c757d',
      textAlign: 'center',
   },
});

export default App;
