// Типы для Яндекс.Карт API
interface YMapsPlacemarkOptions {
  preset?: string
  iconColor?: string
  [key: string]: any
}

interface YMapsPlacemarkProperties {
  balloonContent?: string
  hintContent?: string
  [key: string]: any
}

interface YMapsMapOptions {
  center: number[]
  zoom: number
  controls?: string[]
  [key: string]: any
}

interface YMapsGeoObjectCollection {
  add: (object: any) => void
  remove: (object: any) => void
  removeAll: () => void
}

interface YMapsMap {
  geoObjects: YMapsGeoObjectCollection
  geoObjectsRef?: YMapsGeoObjectCollection
  setCenter: (center: number[]) => void
  setZoom: (zoom: number) => void
  destroy: () => void
}

interface YMapsPlacemark {
  properties: YMapsPlacemarkProperties
  geometry: {
    getCoordinates: () => number[]
  }
}

interface YMapsClustererOptions {
  preset?: string
  groupByCoordinates?: boolean
  clusterDisableClickZoom?: boolean
  clusterHideIconOnBalloonOpen?: boolean
  geoObjectHideIconOnBalloonOpen?: boolean
  clusterBalloonContentLayout?: string
  clusterBalloonItemContentLayout?: string
  clusterBalloonPanelMaxMapArea?: number
  clusterBalloonContentLayoutWidth?: number
  clusterBalloonContentLayoutHeight?: number
  clusterBalloonPagerSize?: number
  clusterBalloonPagerType?: string
  clusterBalloonPagerVisible?: boolean
  [key: string]: any
}

interface YMapsClusterer {
  add: (objects: any[]) => void
  remove: (object: any) => void
  removeAll: () => void
  getBounds: () => any
  [key: string]: any
}

interface YMapsStatic {
  ready: (callback: () => void) => void
  Map: new (element: HTMLElement | string, options: YMapsMapOptions) => YMapsMap
  Placemark: new (
    coordinates: number[],
    properties?: YMapsPlacemarkProperties,
    options?: YMapsPlacemarkOptions
  ) => YMapsPlacemark
  Clusterer: new (options?: YMapsClustererOptions) => YMapsClusterer
}

declare global {
  interface Window {
    ymaps: YMapsStatic
  }
}

export {}
