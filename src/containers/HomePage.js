import React, {useState, useEffect, useRef, useContext} from 'react';
import WebRTCContext from '../components/WebRTC/context';
// import FirebaseContext from '../components/Firebase/context';
import '../assets/css/main.css';

import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import PermCameraMic from '@material-ui/icons/PermCameraMic';
import Group from '@material-ui/icons/Group';
import GroupAdd from '@material-ui/icons/GroupAdd';
import Close from '@material-ui/icons/Close';
import {openUserMedia, createRoom, joinRoomById, hangUp} from '../api/FirebaseService';

const styles = {
  root: {
      minHeight: '100vh',
  },
};

function HomePage(props) {
  const {classes} = props;

  const webRTCContext = useContext(WebRTCContext);
  // const firebaseContext = useContext(FirebaseContext);

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  const getCamera = async () => {
    openUserMedia(localVideo, remoteVideo, webRTCContext);
  }

  return (
    <div className="App">
      <div id="buttons">
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          startIcon={<PermCameraMic />}
          onClick={() => openUserMedia(localVideo, remoteVideo, webRTCContext)}
        >
          Åpne kamera
        </Button>
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          startIcon={<GroupAdd />}
          onClick={() => createRoom(webRTCContext)}
        >
          Lag nytt rom
        </Button>
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          startIcon={<Group />}
          onClick={() => joinRoomById("lVqCHi4WMufJcLceHNHt", webRTCContext)}
        >
          Bli med i rom
        </Button>
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          startIcon={<Close />}
          onClick={() => hangUp(localVideo, webRTCContext)}
        >
          Legg på
        </Button>
      </div>
      <div>
        <span>{webRTCContext.roomId.get}</span>
      </div>
      <div id="videos">
        <video ref={localVideo} muted autoPlay playsInline></video>
        <video ref={remoteVideo} autoPlay playsInline></video>
      </div>
    </div>
  );
}

export default withStyles(styles)(HomePage);
