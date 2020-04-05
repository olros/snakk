import React, {useRef, useContext} from 'react';
import Store from '../store';
import {openUserMedia, createRoom, joinRoomById, hangUp} from '../api/FirebaseService';

// Material UI Components
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

// Icons
import PermCameraMic from '@material-ui/icons/PermCameraMic';
import Group from '@material-ui/icons/Group';
import GroupAdd from '@material-ui/icons/GroupAdd';
import Close from '@material-ui/icons/Close';

const useStyles = makeStyles({
  
});

function HomePage() {
  const classes = useStyles();
  const store = useContext(Store);

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  return (
    <div className="App">
      <div id="buttons">
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          startIcon={<PermCameraMic />}
          onClick={() => openUserMedia(localVideo, remoteVideo, store)}
        >
          Åpne kamera
        </Button>
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          startIcon={<GroupAdd />}
          onClick={() => createRoom(store)}
        >
          Lag nytt rom
        </Button>
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          startIcon={<Group />}
          onClick={() => joinRoomById("lVqCHi4WMufJcLceHNHt", store)}
        >
          Bli med i rom
        </Button>
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          startIcon={<Close />}
          onClick={() => hangUp(localVideo, store)}
        >
          Legg på
        </Button>
      </div>
      <div>
        <span>{store.roomId.get}</span>
      </div>
      <div id="videos">
        <video ref={localVideo} muted autoPlay playsInline></video>
        <video ref={remoteVideo} autoPlay playsInline></video>
      </div>
    </div>
  );
}

export default HomePage;
