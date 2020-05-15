export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: 'pruebatoken',
  // TODO: leer desde archivo de configuracion
  database: {
    mongoURI:
      'mongodb+srv://csantanderv:J7tB5ZxJ0L0tSFR3@cluster0-dwjk1.mongodb.net/test?retryWrites=true&w=majority',
  },
});
