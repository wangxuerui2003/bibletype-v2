<script setup lang="ts">
import maplibregl from "maplibre-gl";

const props = defineProps<{
  places: Array<{
    placeId: string;
    name: string;
    lat: number | null;
    lng: number | null;
    placeType: string;
  }>;
}>();

const mapEl = ref<HTMLDivElement | null>(null);
let map: maplibregl.Map | null = null;
let markers: maplibregl.Marker[] = [];

function renderMarkers() {
  if (!map) {
    return;
  }

  for (const marker of markers) {
    marker.remove();
  }

  markers = props.places
    .filter((place) => place.lat != null && place.lng != null)
    .map((place) => {
      const marker = new maplibregl.Marker({ color: "#e2b714" })
        .setLngLat([place.lng as number, place.lat as number])
        .addTo(map!);

      return marker;
    });

  if (markers[0] && props.places[0]?.lat != null && props.places[0]?.lng != null) {
    map.flyTo({
      center: [props.places[0].lng as number, props.places[0].lat as number],
      zoom: 5,
      speed: 0.7,
    });
  }
}

onMounted(() => {
  if (!mapEl.value) {
    return;
  }

  map = new maplibregl.Map({
    container: mapEl.value,
    style: "https://demotiles.maplibre.org/style.json",
    center: [35.2137, 31.7683],
    zoom: 4,
  });

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

  map.on("load", renderMarkers);
});

watch(
  () => props.places,
  () => renderMarkers(),
  { deep: true },
);

onBeforeUnmount(() => {
  map?.remove();
});
</script>

<template>
  <div class="panel overflow-hidden">
    <div class="flex items-center justify-between border-b border-white/5 px-5 py-4">
      <div>
        <p class="mono text-xs uppercase tracking-[0.24em] text-[var(--color-copy-dim)]">relevant places</p>
        <h3 class="mt-2 text-lg font-semibold">Verse map</h3>
      </div>
      <div class="rounded-full bg-white/5 px-3 py-1 text-xs text-[var(--color-copy-dim)]">
        {{ places.length }} places
      </div>
    </div>

    <div v-if="places.length" ref="mapEl" class="h-64 w-full" />
    <div v-else class="flex h-64 items-center justify-center px-6 text-center text-sm text-[var(--color-copy-dim)]">
      This verse has no mapped places yet.
    </div>

    <div v-if="places.length" class="flex flex-wrap gap-2 px-5 py-4">
      <div
        v-for="place in places"
        :key="place.placeId"
        class="rounded-full bg-white/5 px-3 py-2 text-sm text-[var(--color-copy-dim)]"
      >
        {{ place.name }}
      </div>
    </div>
  </div>
</template>
