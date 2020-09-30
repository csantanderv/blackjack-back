export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: process.env.jwtSecret,
  jwtExpiration: process.env.jwtExpiration,
  mongoURI: process.env.mongoURI,
  cardApi: process.env.cardApi,
  httpConfig: {
    timeout: 60000,
    responseType: 'json',
    responseEncoding: 'utf8',
    maxContentLength: 90000,
    maxBodyLength: 90000,
    maxRedirects: 5,
    decompress: true,
    headers: { 'Content-type': 'application/json' },
  },
});
