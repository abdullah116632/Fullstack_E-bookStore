'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

const getRouteEvent = (pathname) => {
  if (pathname === '/') {
    return { type: 'trackCustom', name: 'RootPageVisit', params: { page: 'root' } }
  }

  if (pathname === '/books') {
    return { type: 'trackCustom', name: 'BooksPageVisit', params: { page: 'books' } }
  }

  if (pathname === '/active-book') {
    return { type: 'trackCustom', name: 'ActiveBookPageVisit', params: { page: 'active-book' } }
  }

  if (pathname?.startsWith('/preview/')) {
    return { type: 'track', name: 'ViewContent', params: { content_name: 'book_preview', page: 'preview' } }
  }

  if (pathname?.startsWith('/purchase/') && pathname !== '/purchase/success') {
    return { type: 'track', name: 'InitiateCheckout', params: { page: 'purchase' } }
  }

  if (pathname === '/purchase/success') {
    return { type: 'track', name: 'Purchase', params: { page: 'purchase_success' } }
  }

  return null
}

export default function FacebookPixel() {
  const pathname = usePathname()
  const lastTrackedPath = useRef('')

  useEffect(() => {
    if (!PIXEL_ID) {
      return
    }

    if (!pathname || lastTrackedPath.current === pathname) {
      return
    }

    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'PageView')

      const routeEvent = getRouteEvent(pathname)
      if (routeEvent) {
        window.fbq(routeEvent.type, routeEvent.name, routeEvent.params)
      }

      lastTrackedPath.current = pathname
    }
  }, [pathname])

  if (!PIXEL_ID) {
    return null
  }

  return (
    <Script id="fb-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s){
          if(f.fbq)return;n=f.fbq=function(){
          n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
      `}
    </Script>
  )
}