'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

const getPathSegment = (pathname, index) => {
  const parts = pathname?.split('/').filter(Boolean) || []
  return parts[index] || ''
}

const getCommonParams = (pathname) => ({
  page_path: pathname,
  page_url: typeof window !== 'undefined' ? window.location.href : '',
  page_title: typeof document !== 'undefined' ? document.title : '',
  traffic_source: 'website',
})

const getRouteEvent = (pathname) => {
  const common = getCommonParams(pathname)
  const previewId = getPathSegment(pathname, 1)
  const purchaseBookId = getPathSegment(pathname, 1)

  if (pathname === '/') {
    return {
      type: 'track',
      name: 'ViewContent',
      params: {
        ...common,
        content_name: 'home_page',
        content_category: 'landing',
        content_type: 'page',
      },
    }
  }

  if (pathname === '/books') {
    return {
      type: 'track',
      name: 'ViewContent',
      params: {
        ...common,
        content_name: 'books_page',
        content_category: 'catalog',
        content_type: 'page',
      },
    }
  }

  if (pathname === '/active-book') {
    return {
      type: 'track',
      name: 'ViewContent',
      params: {
        ...common,
        content_name: 'active_book_page',
        content_category: 'library',
        content_type: 'page',
      },
    }
  }

  if (pathname?.startsWith('/preview/')) {
    return {
      type: 'track',
      name: 'ViewContent',
      params: {
        ...common,
        content_name: 'book_preview_page',
        content_category: 'preview',
        content_type: 'product',
        content_ids: previewId ? [previewId] : [],
      },
    }
  }

  if (pathname?.startsWith('/purchase/') && pathname !== '/purchase/success') {
    return {
      type: 'track',
      name: 'InitiateCheckout',
      params: {
        ...common,
        content_name: 'purchase_page',
        content_category: 'checkout',
        content_type: 'product',
        content_ids: purchaseBookId ? [purchaseBookId] : [],
        num_items: 1,
        currency: 'BDT',
      },
    }
  }

  if (pathname === '/purchase/success') {
    return {
      type: 'track',
      name: 'Purchase',
      params: {
        ...common,
        content_name: 'purchase_success_page',
        content_category: 'checkout',
        content_type: 'product',
        currency: 'BDT',
      },
    }
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