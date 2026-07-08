import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '悦己颜值社 - 发现你的美',
  description: '科学变美，悦己生活',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
