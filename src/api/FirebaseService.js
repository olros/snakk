import firebase from "../firebase";
import URLS from '../URLS';

const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

export const openUserMedia = async (localVideo, store) => {
  const stream = await navigator.mediaDevices.getUserMedia({video: store.shareVideo.get, audio: store.shareAudio.get});
  localVideo.current.srcObject = stream;
  store.localStream.set(stream);

  let newMediaStream = new MediaStream();
  store.remoteStream.set(newMediaStream);
  // remoteVideo.current.srcObject = newMediaStream;
};

export const setScreenUserMedia = async (localVideo, store, showSnackbar) => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia();
    store.localStream.get.getTracks().forEach(function(track) {
      track.stop();
    });
    localVideo.current.srcObject = stream;
    store.localStream.set(stream);

    let newPeerConnection = store.peerConnection.get;
    newPeerConnection.getSenders().map(sender => sender.replaceTrack(stream.getTracks().find(t => t.kind === sender.track?.kind), stream));
    store.peerConnection.set(newPeerConnection);
    store.sharingDisplay.set(true);
  } catch (e) {
    showSnackbar("Denne enheten støtter ikke skjermdeling");
  }
};

// TODO: Image freezes on remote when turning off audio, video or stop sharing screen
export const setCameraUserMedia = async (localVideo, store, video = store.shareVideo.get, audio = store.shareAudio.get) => {
  store.localStream.get.getTracks().forEach(function(track) {
    track.stop();
  });
  const stream = await navigator.mediaDevices.getUserMedia({video: video, audio: audio});
  store.shareVideo.set(video);
  store.shareAudio.set(audio);
  localVideo.current.srcObject = stream;
  store.localStream.set(stream);

  let newPeerConnection = store.peerConnection.get;
  newPeerConnection.getSenders().map(sender => sender.replaceTrack(stream.getTracks().find(t => t.kind === sender.track?.kind), stream));
  store.peerConnection.set(newPeerConnection);
  store.sharingDisplay.set(false);
};

export const createRoom = async (store) => {
  const db = firebase.firestore();
  const roomRef = await db.collection('rooms').doc();
  
  console.log('Create PeerConnection with configuration: ', configuration);
  let peerConnection = new RTCPeerConnection(configuration);

  store.localStream.get.getTracks().forEach(track => {
    peerConnection.addTrack(track, store.localStream.get);
  });

  // Code for collecting ICE candidates below
  const callerCandidatesCollection = roomRef.collection('callerCandidates');

  peerConnection.addEventListener('icecandidate', event => {
    if (!event.candidate) {
      console.log('Got final candidate!');
      return;
    }
    console.log('Got candidate: ', event.candidate);
    callerCandidatesCollection.add(event.candidate.toJSON());
  });
  // Code for collecting ICE candidates above

  // Code for creating a room below
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log('Created offer:', offer);

  const name = store.name.get || "-";
  const roomWithOffer = {
    'offer': {
      type: offer.type,
      sdp: offer.sdp,
      name: name,
    },
  };
  await roomRef.set(roomWithOffer);
  store.roomId.set(roomRef.id);
  console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
  // Code for creating a room above

  peerConnection.addEventListener('track', event => {
    console.log('Got remote track:', event.streams[0]);
    event.streams[0].getTracks().forEach(track => {
      console.log('Add a track to the remoteStream:', track);
      store.remoteStream.get.addTrack(track);
    });
  });

  // Listening for remote session description below
  roomRef.onSnapshot(async snapshot => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data && data.answer) {
      console.log('Got remote description: ', data.answer);
      store.remoteName.set(data.answer.name);
      store.callStart.set(new Date());
      const rtcSessionDescription = new RTCSessionDescription(data.answer);
      await peerConnection.setRemoteDescription(rtcSessionDescription);
    }
  });
  // Listening for remote session description above

  // Listen for remote ICE candidates below
  roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(async change => {
      if (change.type === 'added') {
        let data = change.doc.data();
        console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
  // Listen for remote ICE candidates above

  store.peerConnection.set(peerConnection);

  return roomRef.id;
};

export const roomExists = async (roomId) => {
  const db = firebase.firestore();
  const roomRef = db.collection('rooms').doc(`${roomId}`);
  const roomSnapshot = await roomRef.get();
  return roomSnapshot.exists;
}

export const joinRoomById = async (roomId, store) => {
  const db = firebase.firestore();
  const roomRef = db.collection('rooms').doc(`${roomId}`);
  const roomSnapshot = await roomRef.get();
  console.log('Got room:', roomSnapshot.exists);

  if (roomSnapshot.exists) {
    console.log('Create PeerConnection with configuration: ', configuration);
    let newPeerConnection = new RTCPeerConnection(configuration);
    
    store.localStream.get.getTracks().forEach(track => {
      newPeerConnection.addTrack(track, store.localStream.get);
    });

    // Code for collecting ICE candidates below
    const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
    newPeerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate: ', event.candidate);
      calleeCandidatesCollection.add(event.candidate.toJSON());
    });
    // Code for collecting ICE candidates above

    newPeerConnection.addEventListener('track', event => {
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        store.remoteStream.get.addTrack(track);
      });
    });

    // Code for creating SDP answer below
    const offer = roomSnapshot.data().offer;
    console.log('Got offer:', offer);
    store.remoteName.set(offer.name);
    store.callStart.set(new Date());
    await newPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await newPeerConnection.createAnswer();
    console.log('Created answer:', answer);
    await newPeerConnection.setLocalDescription(answer);

    const name = store.name.get || "-";
    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
        name: name,
      },
    };
    await roomRef.update(roomWithAnswer);
    // Code for creating SDP answer above

    // Listening for remote ICE candidates below
    roomRef.collection('callerCandidates').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await newPeerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    // Listening for remote ICE candidates above

    store.peerConnection.set(newPeerConnection);
  }
};

export const hangUp = async (store) => {
  if (store.remoteStream.get) {
    store.remoteStream.get.getTracks().forEach(track => track.stop());
  }
  if (store.peerConnection.get) {
    store.peerConnection.get.close();
  }
  
  // Delete room on hangup
  if (store.roomId.get) {
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(store.roomId.get);
    const calleeCandidates = await roomRef.collection('calleeCandidates').get();
    calleeCandidates.forEach(async candidate => {
      await candidate.ref.delete();
    });
    const callerCandidates = await roomRef.collection('callerCandidates').get();
    callerCandidates.forEach(async candidate => {
      await candidate.ref.delete();
    });
    await roomRef.delete();
  }

  window.location.href = URLS.landing;
};
