/**
 * Just a simple config for WRTC that makes use of freely accessible Google STUN server.
 */
export default  {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};
