import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import axios from 'axios';
import { Camera } from 'expo-camera';
import { REACT_APP_BACKEND } from 'react-native-dotenv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { ExclamationCircleIcon } from 'react-native-heroicons/outline';
import {
  Context, setChineseAction, addImageAction, setFileAction,
} from '../../Context.jsx';
import Overlay from '../../components/Overlay.jsx';
import styles from './Scan.styles.js';
import CameraView from '../../components/CameraView.jsx';
import CustomButton from '../../components/CustomButton.jsx';

const Scan = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isImage, setIsImage] = useState(false);
  const [isResults, setIsResults] = useState(false);
  const [imageDimension, setImageDimension] = useState({});

  const { store, dispatch } = useContext(Context);
  const { file, chinese } = store;

  let auth;
  const [userId, setUserId] = useState(null);
  let token;

  const camera = useRef(null);
  const isFocused = useIsFocused();

  const requestPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  /** To get userId and token for axios calls at every render */
  useEffect(() => {
    (async () => {
      try {
        setUserId(await AsyncStorage.getItem('@userId'));
        token = await AsyncStorage.getItem('@sessionToken');
        auth = { headers: { Authorization: `Bearer ${token}` } };
      } catch (err) {
        console.log(err);
      }
    })();
  });

  // this will reinitialise this component's state whenever it comes into focus
  // if not then we may run into scenario where user has overlay on from taking a picture
  // switches to image gallery mode and back to scan ->
  // will get a live camera view but prev overlays still active
  useFocusEffect(
    React.useCallback(() => {
      dispatch(setChineseAction([]));
      dispatch(setFileAction(null));
      setIsImage(false);
      setIsResults(false);
    }, []),
  );

  /** Submit function to upload image to db + aws */
  const saveScreenshot = async () => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);
    formData.append('result', chinese); // need to append userId to formData in order to send userId to the backend. This method seems to be the only way - I tried putting formData and userId in an object to send it through but it didn't work.
    const result = await axios.post(`${REACT_APP_BACKEND}/image/uploadimage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      transformRequest: (d) => d,
    });
    console.log(result);
    dispatch(addImageAction(
      {
        id: uuidv4(),
        imagePath: result.data.imagePath,
      },
    ));
    // Adds newly image data to allImages state.
    // I am updating the allImages state on the FE so that the update is instantaneous.
    // The BE is also updated. When the page is reloaded, the image list will still be the latest.
  };

  const continueVideo = () => {
    camera.current.resumePreview();
    dispatch(setChineseAction([]));
    setIsImage(false);
    setIsResults(false);
  };

  if (hasPermission === null || !isFocused) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.noAccessContainer}>
        <ExclamationCircleIcon color="red" size={60} />
        <Text style={styles.noAccess}>PinYinTir needs access to this device&apos;s camera.
          Please tap on the button below to allow access to the camera.
        </Text>
        <CustomButton title="Grant Access" style={styles.grantAccessButton} onPress={requestPermissions} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        camera={camera}
        continueVideo={continueVideo}
        setIsImage={setIsImage}
        isImage={isImage}
        setIsResults={setIsResults}
        setImageDimension={setImageDimension}
        saveScreenshot={saveScreenshot}
      />

      {isResults && (
        <Overlay
          dimension={imageDimension}
          continueVideo={continueVideo}
          toggleOverlay={setIsResults}
          saveScreenshot={saveScreenshot}
          auth={auth}
          userId={userId}
        />
      )}

    </View>
  );
};

export default Scan;
