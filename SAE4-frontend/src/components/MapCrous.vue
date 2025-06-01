<template>
  <div class="page-crous">
    <header class="header-crous">
      <h1>Carte des RU CROUS</h1>
    </header>
    <div class="map-container">
      <div id="map"></div>
      <button class="geoloc-btn" @click="geolocaliser">Me localiser</button>
    </div>
    
    <div v-if="RUselectionner" class="ru-info">
      <h2>{{ RUselectionner.name }}</h2>
      <div v-if="RUselectionner.zone"><b>Zone :</b> {{ RUselectionner.zone }}</div>
      <div v-if="RUselectionner.region"><b>Région :</b> {{ RUselectionner.region }}</div>
      <div v-if="RUselectionner.description"><b>Description :</b> {{ RUselectionner.description }}</div>
      <div v-if="RUselectionner.opening"><b>Horaires :</b> {{ RUselectionner.opening }}</div>
      <div v-if="RUselectionner.contact" v-html="RUselectionner.contact"></div>
      <div v-if="RUselectionner.infos" v-html="RUselectionner.infos"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

let toutLesRU = []
let markerCluster
let map        
let markerGeoloc = null
const RUselectionner = ref(null)

const ruIcon = L.icon({
  iconUrl: '/Map-Marker-PNG-File(1).png',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
})

async function recuperationDeToutLesRU() {
  let page = 1
  const pageSize = 100
  let toutLesRU = []
  let total = null
  do {
    const reponse = await fetch(`http://localhost:1337/api/crousp?pagination[page]=${page}&pagination[pageSize]=${pageSize}`)
    const data = await reponse.json()
    if (total === null) total = data.meta.pagination.total
    toutLesRU = toutLesRU.concat(data.data)
    page++
  } while (toutLesRU.length < total)
  return toutLesRU
}

function afficherMarkersEtCluster(map) {
  if (markerCluster) {
    map.removeLayer(markerCluster)
  }
  markerCluster = L.markerClusterGroup()
  const bounds = map.getBounds()

  toutLesRU.forEach(resto => {
    if (
      resto.latitude !== null &&
      resto.latitude !== undefined &&
      resto.longitude !== null &&
      resto.longitude !== undefined
    ) {
      const latlng = L.latLng(resto.latitude, resto.longitude)
      if (bounds.contains(latlng)) {

        const marker = L.marker(latlng, { icon: ruIcon }).bindPopup(`<b>${resto.name}</b><br>${resto.zone || ''}`)
        marker.on('click', () => {
          RUselectionner.value = resto
        })
        markerCluster.addLayer(marker)
      }
    }
  })

  map.addLayer(markerCluster)
}

function geolocaliser() {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords
      map.setView([latitude, longitude], 14)
      if (markerGeoloc) {
        map.removeLayer(markerGeoloc)
      }
      markerGeoloc = L.marker([latitude, longitude], {
        icon: L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          shadowSize: [41, 41]
        })
      }).addTo(map).bindPopup('Vous êtes ici !').openPopup()
    },
  )
}

onMounted(async () => {
  await nextTick()
  map = L.map('map').setView([46.8, 2.5], 6)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  toutLesRU = await recuperationDeToutLesRU()
  afficherMarkersEtCluster(map)
  map.on('moveend', () => afficherMarkersEtCluster(map))
  map.on('zoomend', () => afficherMarkersEtCluster(map))

  geolocaliser()
})
</script>