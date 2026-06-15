import { forwardRef, type ReactNode, useCallback, useImperativeHandle, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { FormScrollContext } from '@/contexts/FormScrollContext';

interface KeyboardAwareScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  extraKeyboardSpace?: number;
}

export const KeyboardAwareScreen = forwardRef<ScrollView, KeyboardAwareScreenProps>(
  function KeyboardAwareScreen(
    { children, style, contentContainerStyle, extraKeyboardSpace = 32 },
    ref,
  ) {
    const contentRef = useRef<View>(null);
    const scrollRef = useRef<ScrollView>(null);
    useImperativeHandle(ref, () => scrollRef.current as ScrollView);

    const scrollFieldIntoView = useCallback((fieldRef: View) => {
      const scroll = scrollRef.current;
      const content = contentRef.current;
      if (!scroll || !content) return;

      fieldRef.measureLayout(
        content,
        (_x, y) => {
          scroll.scrollTo({ y: Math.max(0, y - 24), animated: true });
        },
        () => {},
      );
    }, []);

    const scrollView = (
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 32 + extraKeyboardSpace },
        ]}
        showsVerticalScrollIndicator={false}
        {...(Platform.OS === 'ios'
          ? { automaticallyAdjustKeyboardInsets: true }
          : {})}
      >
        <View ref={contentRef} style={contentContainerStyle} collapsable={false}>
          {children}
        </View>
      </ScrollView>
    );

    return (
      <FormScrollContext.Provider value={scrollFieldIntoView}>
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView
            style={[styles.flex, style]}
            behavior="padding"
            keyboardVerticalOffset={90}
          >
            {scrollView}
          </KeyboardAvoidingView>
        ) : (
          <View style={[styles.flex, style]}>{scrollView}</View>
        )}
      </FormScrollContext.Provider>
    );
  },
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
  },
});
