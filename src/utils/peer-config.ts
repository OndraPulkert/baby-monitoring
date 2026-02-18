import type { PeerJSOption } from 'peerjs';

export const PEER_CONFIG: PeerJSOption = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:a.relay.metered.ca:80',
        username: 'e4992e23ccd40511ec0061dc',
        credential: 'gzmzjVEmGjKXAGic',
      },
      {
        urls: 'turn:a.relay.metered.ca:80?transport=tcp',
        username: 'e4992e23ccd40511ec0061dc',
        credential: 'gzmzjVEmGjKXAGic',
      },
      {
        urls: 'turn:a.relay.metered.ca:443',
        username: 'e4992e23ccd40511ec0061dc',
        credential: 'gzmzjVEmGjKXAGic',
      },
      {
        urls: 'turns:a.relay.metered.ca:443?transport=tcp',
        username: 'e4992e23ccd40511ec0061dc',
        credential: 'gzmzjVEmGjKXAGic',
      },
    ],
  },
};