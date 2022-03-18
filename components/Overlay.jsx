import React from 'react';
import {
  Dimensions, View, StyleSheet, TouchableOpacity,
} from 'react-native';
import { ArrowLeftIcon, DocumentTextIcon } from 'react-native-heroicons/outline';
import { MenuProvider } from 'react-native-popup-menu';
import OverlayTextButton from './OverlayTextButton.jsx';

const styles = StyleSheet.create({
  overlay: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    position: 'absolute',
  },
  buttonContainer: {
    position: 'absolute',
    top: 0,
    padding: 5,
    zIndex: 100,
  },
  button: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
    borderColor: 'white',
    borderWidth: 1,
    marginBottom: 5,
  },
});

const Overlay = ({
  returnData, dimension, continueVideo, toggleOverlay,
}) => {
  let heightRatio = 1;
  let widthRatio = 1;
  if (dimension.height) {
    heightRatio = Number(Dimensions.get('window').height) / Number(dimension.height);
    widthRatio = Number(Dimensions.get('window').width) / Number(dimension.width);
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={continueVideo}>
          <ArrowLeftIcon color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => toggleOverlay((prev) => !prev)}
        >
          <DocumentTextIcon color="white" />
        </TouchableOpacity>
      </View>
      <MenuProvider>
        {returnData.map((text) => (
          <OverlayTextButton
            key={text.id}
            pinyin={text.pinyin}
            chinese={text.characters}
            translation={text.translation}
            text={text}
            styles={{
              top: text.vertices[0].y * heightRatio,
              left: text.vertices[0].x * widthRatio,
            }}
          />
        ))}
      </MenuProvider>
    </View>
  );
};
export default Overlay;
