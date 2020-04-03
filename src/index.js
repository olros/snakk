import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import URLS from './URLS';

// Theme
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import './assets/css/main.css';

// Service and action imports
import WebRTCContext from './components/WebRTC/context';

// Project containers
import HomePage from './containers/HomePage';

function App() {
    const [peerConnection, setPeerConnection] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [roomDialog, setRoomDialog] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const store = {
        peerConnection: {get: peerConnection, set: setPeerConnection},
        localStream: {get: localStream, set: setLocalStream},
        remoteStream: {get: remoteStream, set: setRemoteStream},
        roomDialog: {get: roomDialog, set: setRoomDialog},
        roomId: {get: roomId, set: setRoomId}
    };
    
    return (
        <WebRTCContext.Provider value={store}>
            <BrowserRouter>
                <MuiThemeProvider theme={theme}>
                    <Switch>
                        <Route exact path={URLS.landing} component={HomePage} />
                    </Switch>
                </MuiThemeProvider>
            </BrowserRouter>
        </WebRTCContext.Provider>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
