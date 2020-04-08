import React, { useState, useRef, useEffect, useContext } from 'react';
import URLS from '../URLS';
import Store from '../store';
import { Link } from 'react-router-dom';
import { openUserMedia, roomExists, joinRoomById, hangUp, setScreenUserMedia, setCameraUserMedia } from '../api/FirebaseService';
import classnames from 'classnames';

// Components
import ShareDialog from '../components/ShareDialog';

// Material UI Components
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

// Icons
import CloseIcon from '@material-ui/icons/Close';
import ShareRoundedIcon from '@material-ui/icons/ShareRounded';
import ScreenShareRoundedIcon from '@material-ui/icons/ScreenShareRounded';
import CameraAltRoundedIcon from '@material-ui/icons/CameraAltRounded';
import Group from '@material-ui/icons/Group';
import PermCameraMic from '@material-ui/icons/PermCameraMic';
import CallEndRoundedIcon from '@material-ui/icons/CallEndRounded';
// import MicIcon from '@material-ui/icons/Mic';
// import MicOffIcon from '@material-ui/icons/MicOff';
// import VideocamIcon from '@material-ui/icons/Videocam';
// import VideocamOffIcon from '@material-ui/icons/VideocamOff';

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
        marginBottom: 20,
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
    remoteVideo: {
        width: '100%',
        height: 'calc(100vh - 40px)',
        objectFit: 'cover',
        margin: 'auto',
        borderRadius: 4,
    },
    localVideo: {
        width: 300,
        maxWidth: '50%',
        position: 'fixed',
        right: 20,
        bottom: 20,
        transform: 'rotateY(180deg)',
        borderRadius: '0px 4px',
        border: '1px solid #111',
    },
    remoteName: {
        top: 23,
        right: 25,
        position: 'fixed',
        textShadow: '0px 0px 10px #fff',
        color: '#000',
    },
    duration: {
        top: 23,
        left: 25,
        position: 'fixed',
        textShadow: '0px 0px 10px #fff',
        color: '#000',
    },
    hide: {
        display: 'none',
    },
    button: {
        height: 60,
    },
    fabContainer: {
        position: 'fixed',
        left: 20,
        bottom: 20,
        display: 'flex',
        flexDirection: 'row',
        '@media only screen and (max-width: 600px)': {
            flexDirection: 'column-reverse',
        },
    },
    fab: {
        margin: 5,
    },
    redFab: {
        backgroundColor: '#a30000',
    },
});

function Room(props) {
    const classes = useStyles();
    const store = useContext(Store);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [joined, setJoined] = useState(store.name.get !== null && store.localStream.get !== null);
    const [duration, setDuration] = useState(null);

    useEffect(() => {
        if (store.remoteName.get !== null && duration == null) setInterval(() => setDuration(d => d + 1), 1000);
    }, [store.remoteName.get, duration]);

    useEffect(() => {
        if (joined) {
            remoteVideo.current.srcObject = store.remoteStream.get;
            localVideo.current.srcObject = store.localStream.get;
        }
    }, [joined, store.remoteStream.get, store.localStream.get]);

    const previewVideo = useRef(null);
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);

    const joinRoom = async (e) => {
        e.preventDefault();
        if (store.localStream.get !== null) {
            if (await roomExists(props.match.params.id)) {
                joinRoomById(props.match.params.id, store);
                setJoined(true);
            } else {
                showSnackbar("Dette rommet eksisterer ikke");
            }
        } else {
            showSnackbar("Du må gi tilgang til kamera og mikrofon");
        }
    }

    const showSnackbar = (message) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    }

    const share = () => {
        if (navigator.share) {
            navigator.share({
              title: 'Snakk med meg',
              url: window.location.href
            });
          } else {
            setShareDialogOpen(true)
          }
    }

    const formatTime = (time) => {
        const hours = Math.floor(time / 60 / 60);
        const minutes = Math.floor(time / 60) - (hours * 60);
        const seconds = time % 60;
        return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }

    return (
        <div className={classes.root}>
            {joined ?
                <React.Fragment>
                    <video ref={remoteVideo} autoPlay playsInline className={store.remoteStream.get === null ? classes.hide : classes.remoteVideo}></video>
                    <video ref={localVideo} muted autoPlay playsInline className={store.localStream.get === null ? classes.hide : classes.localVideo}></video>
                    <Typography variant="h6" className={classes.remoteName}>{store.remoteName.get}</Typography>
                    <Typography variant="h6" className={classes.duration}>{formatTime(duration)}</Typography>
                    <div className={classes.fabContainer}>
                        <Tooltip title="Legg på" aria-label="Legg på">
                            <Fab color="inherit" className={classnames(classes.fab, classes.redFab)} onClick={() => hangUp(store)}>
                                <CallEndRoundedIcon />
                            </Fab>
                        </Tooltip>
                        <Tooltip title="Del link" aria-label="Del link">
                            <Fab color="primary" className={classes.fab} onClick={() => share()}>
                                <ShareRoundedIcon />
                            </Fab>
                        </Tooltip>
                        {!store.sharingDisplay.get ?
                            <React.Fragment>
                                <Tooltip title="Del skjerm" aria-label="Del skjerm">
                                    <Fab color="primary" className={classes.fab} onClick={() => setScreenUserMedia(localVideo, store, showSnackbar)}>
                                        <ScreenShareRoundedIcon />
                                    </Fab>
                                </Tooltip>
                                {/* <Tooltip title="Del kamera" aria-label="Del kamera">
                                    <Fab color="primary" className={classes.fab} onClick={() => setCameraUserMedia(localVideo, store, !store.shareVideo.get, store.shareAudio.get)}>
                                        {store.shareVideo.get ? <VideocamIcon /> : <VideocamOffIcon /> }
                                    </Fab>
                                </Tooltip>
                                <Tooltip title="Del lyd" aria-label="Del lyd">
                                    <Fab color="primary" className={classes.fab} onClick={() => setCameraUserMedia(localVideo, store, store.shareVideo.get, !store.shareAudio.get)}>
                                        {store.shareAudio.get ? <MicIcon /> : <MicOffIcon /> }
                                    </Fab>
                                </Tooltip> */}
                            </React.Fragment>
                        :
                            <Tooltip title="Del kamera" aria-label="Del kamera">
                                <Fab color="primary" className={classes.fab} onClick={() => setCameraUserMedia(localVideo, store)}>
                                    <CameraAltRoundedIcon />
                                </Fab>
                            </Tooltip>
                        }
                    </div>
                </React.Fragment>
            :
                <Paper elevation={3} className={classes.paper}>
                    <form className={classes.flex} autoComplete="off" onSubmit={joinRoom}>
                        <Link to={URLS.landing}><Typography variant="h1" className={classes.header}>Snakk</Typography></Link>
                        <Typography variant="subtitle1" className={classes.subtitle}>Velkommen til Snakk!<br/>Skriv inn ditt navn og del kamera for å bli med.</Typography>
                        <TextField onChange={(event) => store.name.set(event.target.value)} className={classes.input} label="Skriv inn ditt navn" variant="filled" required />
                        <Button
                            variant="outlined"
                            color="secondary"
                            className={store.localStream.get !== null ? classes.hide : classes.videoButton}
                            startIcon={<PermCameraMic />}
                            onClick={() => openUserMedia(previewVideo, store)}
                            >
                            Åpne kamera og mikrofon
                        </Button>
                        <video ref={previewVideo} muted autoPlay playsInline className={store.localStream.get === null ? classes.hide : classes.video}></video>
                        <Button
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            startIcon={<Group />}
                            type='submit'
                            >
                            Bli med
                        </Button>
                    </form>
                </Paper>
            }
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
            <ShareDialog url={window.location.href} open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} showSnackbar={showSnackbar} />
        </div>
    );
}

export default Room;
