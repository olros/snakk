import firebase from "../components/Firebase/firebase";

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

export const openUserMedia = async (localVideo, remoteVideo, context) => {
  const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
  // Get user screen
  // const stream = await navigator.mediaDevices.getDisplayMedia();
  localVideo.current.srcObject = stream;
  context.localStream.set(stream);
  let newMediaStream = new MediaStream();
  context.remoteStream.set(newMediaStream);
  remoteVideo.current.srcObject = newMediaStream;

  console.log('Stream:', stream);
};

export const createRoom = async (context) => {
  const db = firebase.firestore();
  const roomRef = await db.collection('rooms').doc();
  
  console.log('Create PeerConnection with configuration: ', configuration);
  let peerConnection = new RTCPeerConnection(configuration);

  context.localStream.get.getTracks().forEach(track => {
    peerConnection.addTrack(track, context.localStream.get);
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

  const roomWithOffer = {
    'offer': {
      type: offer.type,
      sdp: offer.sdp,
    },
  };
  await roomRef.set(roomWithOffer);
  context.roomId.set(roomRef.id);
  console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
  // Code for creating a room above

  peerConnection.addEventListener('track', event => {
    console.log('Got remote track:', event.streams[0]);
    event.streams[0].getTracks().forEach(track => {
      console.log('Add a track to the remoteStream:', track);
      context.remoteStream.get.addTrack(track);
    });
  });

  // Listening for remote session description below
  roomRef.onSnapshot(async snapshot => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data && data.answer) {
      console.log('Got remote description: ', data.answer);
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

  context.peerConnection.set(peerConnection);
};

export const joinRoom = (context) => {
  // document.querySelector('#createBtn').disabled = true;
  // document.querySelector('#joinBtn').disabled = true;

  // document.querySelector('#confirmJoinBtn').addEventListener('click', async () => {
  //       context.roomId.set(document.querySelector('#room-id').value);
  //       console.log('Join room: ', context.roomId.get);
  //       document.querySelector(
  //           '#currentRoom').innerText = `Current room is ${context.roomId.get} - You are the callee!`;
  //       await this.joinRoomById(context.roomId.get);
  //     }, {once: true});
  // context.roomDialog.get.open();
};

export const joinRoomById = async (roomId, context) => {
  const db = firebase.firestore();
  const roomRef = db.collection('rooms').doc(`${roomId}`);
  const roomSnapshot = await roomRef.get();
  console.log('Got room:', roomSnapshot.exists);

  if (roomSnapshot.exists) {
    console.log('Create PeerConnection with configuration: ', configuration);
    let newPeerConnection = new RTCPeerConnection(configuration);
    
    context.localStream.get.getTracks().forEach(track => {
      newPeerConnection.addTrack(track, context.localStream.get);
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
        context.remoteStream.get.addTrack(track);
      });
    });

    // Code for creating SDP answer below
    const offer = roomSnapshot.data().offer;
    console.log('Got offer:', offer);
    await newPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await newPeerConnection.createAnswer();
    console.log('Created answer:', answer);
    await newPeerConnection.setLocalDescription(answer);

    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
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

    context.peerConnection.set(newPeerConnection);
  }
};

export const hangUp = async (localVideo, context) => {
  if (localVideo.srcObject) {
    localVideo.srcObject.getTracks().forEach(track => track.stop());
  }
  if (context.remoteStream.get) {
    context.remoteStream.get.getTracks().forEach(track => track.stop());
  }

  if (context.peerConnection.get) {
    context.peerConnection.get.close();
  }
  
  // Delete room on hangup
  if (context.roomId.get) {
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(context.roomId.get);
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

  document.location.reload(true);
};
