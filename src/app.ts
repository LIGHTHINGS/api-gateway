import restana, { Protocol } from 'restana';
import https from 'https';
import fs from 'fs';

type GatewayOptions = {
  protocol?: 'http' | 'https' | 'http2';
};

export function createGateway({ protocol = 'http' }: GatewayOptions) {
  if (protocol === 'http2') {
    return restana({ server: require('http2').createServer() });
  }

  if (protocol === 'https') {
    const options = {
      // key: fs.readFileSync('./certs/key.pem'),
      // cert: fs.readFileSync('./certs/cert.pem'),
    };
    return restana({ server: https.createServer(options) });
  }

  // default http
  return restana();
}
