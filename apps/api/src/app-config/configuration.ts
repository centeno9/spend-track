export default () => ({
  app: {
    port: process.env.PORT ?? 3000
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    rounds: process.env.BCRYPT_SALT_ROUNDS,
  }
})