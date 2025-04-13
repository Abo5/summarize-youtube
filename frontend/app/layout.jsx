import './globals.css'

// أمثلة لبيانات الـmetadata لو أردت استخدامها في Next.js
export const metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
