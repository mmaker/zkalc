import React from 'react'
import { Inter } from 'next/font/google'
import StyledComponentsRegistry from './antdRegistry'
import "../styles/globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'zkalc',
    description: 'zkalc is a cryptographic calculator!',
    openGraph: {
           images: ['../public/logo.png']
    }
}

function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  )
}

export default RootLayout
