export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: 'pruebatoken',
  jwtExpiration: '1d',
  // TODO: leer desde archivo de configuracion
  mongoURI:
    'mongodb+srv://csantanderv:J7tB5ZxJ0L0tSFR3@cluster0-dwjk1.mongodb.net/test?retryWrites=true&w=majority',
  cardApi: 'https://deckofcardsapi.com/api/deck',
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
