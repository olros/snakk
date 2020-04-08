import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import URLS from './URLS';

// Theme
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import './assets/css/main.css';

// Service and action imports
import Store from './store';

// Project containers
import Landing from './containers/Landing';
import Room from './containers/Room';

function App() {
    const [peerConnection, setPeerConnection] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [name, setName] = useState(null);
    const [remoteName, setRemoteName] = useState(null);
    const [shareVideo, setShareVideo] = useState(true);
    const [shareAudio, setShareAudio] = useState(true);
    const [sharingDisplay, setSharingDisplay] = useState(false);
    const [callStart, setCallStart] = useState(null);
    const store = {
        peerConnection: {get: peerConnection, set: setPeerConnection},
        localStream: {get: localStream, set: setLocalStream},
        remoteStream: {get: remoteStream, set: setRemoteStream},
        roomId: {get: roomId, set: setRoomId},
        name: {get: name, set: setName},
        remoteName: {get: remoteName, set: setRemoteName},
        shareVideo: {get: shareVideo, set: setShareVideo},
        shareAudio: {get: shareAudio, set: setShareAudio},
        sharingDisplay: {get: sharingDisplay, set: setSharingDisplay},
        callStart: {get: callStart, set: setCallStart}
    };
    
    return (
        <Store.Provider value={store}>
            <BrowserRouter>
                <MuiThemeProvider theme={theme}>
                    <Switch>
                        <Route exact path={URLS.landing} component={Landing} />
                        <Route path={URLS.room.concat(':id/')} component={Room} />
                    </Switch>
                </MuiThemeProvider>
            </BrowserRouter>
        </Store.Provider>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
