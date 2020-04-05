import React, { useState, useRef, useEffect, useContext } from 'react';
import URLS from '../URLS';
import Store from '../store';
import { Link, useHistory } from 'react-router-dom';
import { openUserMedia, roomExists, createRoom } from '../api/FirebaseService';

// Material UI Components
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';

// Icons
import CloseIcon from '@material-ui/icons/Close';
import Add from '@material-ui/icons/Add';
import Group from '@material-ui/icons/Group';
import PermCameraMic from '@material-ui/icons/PermCameraMic';

const useStyles = makeStyles({
    root: {
        padding: 20,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    paper: {
        maxWidth: 700,
        margin: 'auto',
        width: '100%',
        backgroundColor: 'var(--secondary-background)',
        padding: 20,
        marginBottom: 20,
    },
    flex: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    header: {
        paddingTop: 40,
        paddingBottom: 40,
        color: 'var(--text-color)',
        textAlign: 'center',
        fontWeight: 600,
    },
    subtitle: {
        color: 'var(--text-color)',
        textAlign: 'center',
    },
    options: {
        display: 'flex',
        marginTop: 30,
        '@media only screen and (max-width: 600px)': {
            flexDirection: 'column',
        },
    },
    option: {
        width: '100%',
        height: 60,
        marginTop: 0,
        marginBottom: 0,
        marginRight: 10,
        marginLeft: 10,
        fontSize: 17,
        '@media only screen and (max-width: 600px)': {
            marginTop: 10,
            marginBottom: 10,
            marginRight: 0,
            marginLeft: 0,
        },
    },
    input: {
        marginBottom: 16,
        '& label': {
            color: 'var(--text-color)',
        },
        '& input': {
            color: 'var(--text-color)',
        },
    },
    videoButton: {
        height: 40,
        marginBottom: 20,
    },
    video: {
        width: '100%',
        marginBottom: 20,
        borderRadius: 4,
        transform: 'rotateY(180deg)',
    },
    hide: {
        display: 'none',
    },
    button: {
        height: 60,
    },
});

function Landing(props) {
  const classes = useStyles();
  const store = useContext(Store);
    let history = useHistory();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
  const localVideo = useRef(null);

  const [join, setJoin] = useState(false);

  useEffect(() => {
    localVideo.current.srcObject = store.localStream.get;
  }, [store.localStream.get]);

  const joinRoom = async (e) => {
    e.preventDefault();
    if (join) {
        if (await roomExists(store.roomId.get)) {
            history.push(URLS.room.concat(store.roomId.get).concat('/'));
        } else {
            showSnackbar("This room does not exist");
        }
    } else {
        if (store.localStream.get !== null) {
            const roomId = await createRoom(store);
            history.push(URLS.room.concat(roomId).concat('/'));
        } else {
            showSnackbar("Camera access not given");
        }
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  }

  return (
    <div className={classes.root}>
        <Paper elevation={3} className={classes.paper} >
            <Link to={URLS.landing}><Typography variant="h1" className={classes.header}>Snakk</Typography></Link>
            <Typography variant="subtitle1" className={classes.subtitle}>Velkommen til Snakk!<br/>Her kan du enkelt lage en videosamtale med andre.<br/>Bare start samtalen og del linken din.</Typography>
            <div className={classes.options}>
                <Button
                    variant={!join ? 'contained' : 'outlined'}
                    color={!join ? 'primary' : 'secondary'}
                    className={classes.option}
                    startIcon={<Add />}
                    onClick={() => setJoin(false)}
                    >
                    Lag nytt rom
                </Button>
                <Button
                    variant={join ? 'contained' : 'outlined'}
                    color={join ? 'primary' : 'secondary'}
                    className={classes.option}
                    startIcon={<Group />}
                    onClick={() => setJoin(true)}
                    >
                    Bli med i rom
                </Button>
            </div>
        </Paper>
        <Paper elevation={3} className={classes.paper}>
            <form className={classes.flex} autoComplete="off" onSubmit={joinRoom}>
                {join ?
                    <TextField onChange={(event) => store.roomId.set(event.target.value)} value={store.roomId.get || ""} className={classes.input} label="Skriv inn rom-ID" variant="filled" required />
                :
                    <React.Fragment>
                        <TextField onChange={(event) => store.name.set(event.target.value)} value={store.name.get || ""} className={classes.input} label="Skriv inn ditt navn" variant="filled" required />
                        <Button
                            variant="outlined"
                            color="secondary"
                            className={store.localStream.get !== null ? classes.hide : classes.videoButton}
                            startIcon={<PermCameraMic />}
                            onClick={() => openUserMedia(localVideo, store)}
                            >
                            Åpne kamera og mikrofon
                        </Button>
                        <video ref={localVideo} muted autoPlay playsInline className={store.localStream.get === null ? classes.hide : classes.video}></video>
                    </React.Fragment>
                }
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    startIcon={join ? <Group /> : <Add />}
                    type='submit'
                    >
                    {join ? "Bli med" : "Lag nytt rom"}
                </Button>
            </form>
        </Paper>
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            message={snackbarMessage}
            action={<IconButton size="small" aria-label="close" color="inherit" onClick={() => setSnackbarOpen(false)}><CloseIcon fontSize="small" /></IconButton>}
        />
    </div>
  );
}

export default Landing;
