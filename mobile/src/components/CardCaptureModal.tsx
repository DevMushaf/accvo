import { useEffect, useRef } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { WebView } from 'react-native-webview';

interface CardCaptureModalProps {
  visible: boolean;
  html: string;
  onCaptured: (uri: string) => void;
  onError: () => void;
  onClose: () => void;
}

export function CardCaptureModal({ visible, html, onCaptured, onError, onClose }: CardCaptureModalProps) {
  const shotRef = useRef<View>(null);
  const capturedRef = useRef(false);

  useEffect(() => {
    capturedRef.current = false;
  }, [html, visible]);

  async function handleLoadEnd() {
    if (!visible || capturedRef.current || !shotRef.current) return;
    capturedRef.current = true;
    try {
      await new Promise((r) => setTimeout(r, 350));
      const uri = await captureRef(shotRef, { format: 'png', quality: 1, result: 'tmpfile' });
      onCaptured(uri);
      onClose();
    } catch {
      onError();
      onClose();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.offscreen} pointerEvents="none">
        <View ref={shotRef} collapsable={false} style={styles.captureBox}>
          {html ? (
            <WebView
              originWhitelist={['*']}
              source={{ html }}
              style={styles.webview}
              scrollEnabled={false}
              onLoadEnd={() => void handleLoadEnd()}
            />
          ) : (
            <ActivityIndicator />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    left: -2000,
    top: 0,
    opacity: 0.01,
  },
  captureBox: {
    width: 380,
    height: 280,
    backgroundColor: '#E8EDF4',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
