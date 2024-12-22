export {}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: 'admin' | 'mentor' | 'user'
    }
  }
}