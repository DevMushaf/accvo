import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';

/** True once the current screen's open animation has finished. */
export function useAfterTransition() {
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => setReady(true));
      return () => {
        task.cancel();
        setReady(false);
      };
    }, []),
  );

  return ready;
}
