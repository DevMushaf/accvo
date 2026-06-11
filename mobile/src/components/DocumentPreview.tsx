import { forwardRef, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface DocumentPreviewProps {
  html: string;
  /** Forces WebView reload when logo or template changes. */
  reloadKey?: string | number;
}

export const DocumentPreview = memo(
  forwardRef<View, DocumentPreviewProps>(function DocumentPreview({ html, reloadKey }, ref) {
  if (!html) {
    return <View ref={ref} style={styles.container} />;
  }

  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      <WebView
        key={reloadKey}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        nestedScrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        setBuiltInZoomControls={false}
        overScrollMode="never"
        androidLayerType="hardware"
        cacheEnabled={false}
        scalesPageToFit={false}
      />
    </View>
  );
  }),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EDF4',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
