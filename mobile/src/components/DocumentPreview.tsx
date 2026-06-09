import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface DocumentPreviewProps {
  html: string;
}

export const DocumentPreview = memo(function DocumentPreview({ html }: DocumentPreviewProps) {
  if (!html) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled
        nestedScrollEnabled
        showsVerticalScrollIndicator
        setBuiltInZoomControls={false}
        overScrollMode="never"
        androidLayerType="hardware"
        cacheEnabled
      />
    </View>
  );
});

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
