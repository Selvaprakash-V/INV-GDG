// pages/_app.js
import { MotionConfig } from 'framer-motion'

export default function App({ Component, pageProps }) {
  return (
    <MotionConfig reducedMotion="user">
      <Component {...pageProps} />
    </MotionConfig>
  )
}