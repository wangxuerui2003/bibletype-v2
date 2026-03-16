<script setup lang="ts">
import maplibregl from "maplibre-gl";

const props = defineProps<{
  places: Array<{
    placeId: string;
    name: string;
    lat: number | null;
    lng: number | null;
    placeType: string;
    source?: string;
    geojson?: Record<string, unknown> | null;
  }>;
  compact?: boolean;
}>();

const mapEl = ref<HTMLDivElement | null>(null);
const selectedPlaceId = ref<string | null>(null);
let map: maplibregl.Map | null = null;
let markers: maplibregl.Marker[] = [];

const visiblePlaces = computed(() => props.places.slice(0, 8));
const activePlace = computed(
  () =>
    visiblePlaces.value.find((place) => place.placeId === selectedPlaceId.value) ??
    visiblePlaces.value[0] ??
    null,
);

function focusPlace() {
  if (!map || !activePlace.value) {
    return;
  }

  if (activePlace.value.lat != null && activePlace.value.lng != null) {
    map.flyTo({
      center: [activePlace.value.lng, activePlace.value.lat],
      zoom: 6,
      speed: 0.7,
    });
  }
}

function renderMarkers() {
  if (!map) {
    return;
  }

  for (const marker of markers) {
    marker.remove();
  }

  markers = visiblePlaces.value
    .filter((place) => place.lat != null && place.lng != null)
    .map((place) => {
      const marker = new maplibregl.Marker({ color: "#e2b714" })
        .setLngLat([place.lng as number, place.lat as number])
        .addTo(map!);

      marker.getElement().addEventListener("click", () => {
        selectedPlaceId.value = place.placeId;
        focusPlace();
      });

      return marker;
    });

  if (map.getSource("places-geojson")) {
    map.removeLayer("places-outline");
    map.removeLayer("places-fill");
    map.removeSource("places-geojson");
  }

  const features = visiblePlaces.value
    .filter((place) => place.geojson)
    .map((place) => place.geojson as Record<string, unknown>)
    .filter(Boolean) as Record<string, unknown>[];

  if (features.length) {
    map.addSource("places-geojson", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features,
      } as any,
    });

    map.addLayer({
      id: "places-fill",
      type: "fill",
      source: "places-geojson",
      paint: {
        "fill-color": "#e2b714",
        "fill-opacity": 0.15,
      },
    });

    map.addLayer({
      id: "places-outline",
      type: "line",
      source: "places-geojson",
      paint: {
        "line-color": "#e2b714",
        "line-width": 2,
      },
    });
  }

  if (!selectedPlaceId.value && visiblePlaces.value[0]) {
    selectedPlaceId.value = visiblePlaces.value[0].placeId;
  }

  focusPlace();
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
  () => {
    if (!visiblePlaces.value.some((place) => place.placeId === selectedPlaceId.value)) {
      selectedPlaceId.value = visiblePlaces.value[0]?.placeId ?? null;
    }
    renderMarkers();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  map?.remove();
});
</script>

<template>
  <div
    class="panel overflow-hidden"
    :class="props.compact ? 'w-full max-w-[360px]' : ''"
  >
    <div
      class="flex items-center justify-between border-b border-white/5"
      :class="props.compact ? 'px-4 py-3' : 'px-5 py-4'"
    >
      <div>
        <p class="mono text-xs uppercase tracking-[0.24em] text-[var(--color-copy-dim)]">relevant places</p>
        <h3 class="mt-2 font-semibold" :class="props.compact ? 'text-base' : 'text-lg'">Verse map</h3>
        <p v-if="activePlace" class="mt-1 text-xs text-[var(--color-copy-dim)]">
          Focus: {{ activePlace.name }} · {{ activePlace.placeType }}
        </p>
      </div>
      <div class="rounded-full bg-white/5 px-3 py-1 text-xs text-[var(--color-copy-dim)]">
        {{ visiblePlaces.length }} places
      </div>
    </div>

    <div v-if="visiblePlaces.length" ref="mapEl" class="w-full" :class="props.compact ? 'h-44' : 'h-64'" />
    <div
      v-else
      class="flex items-center justify-center text-center text-sm text-[var(--color-copy-dim)]"
      :class="props.compact ? 'h-44 px-4' : 'h-64 px-6'"
    >
      This verse has no mapped places yet.
    </div>

    <div
      v-if="visiblePlaces.length"
      class="flex flex-wrap gap-2"
      :class="props.compact ? 'max-h-28 overflow-y-auto px-4 py-3' : 'px-5 py-4'"
    >
      <div
        v-for="place in visiblePlaces"
        :key="place.placeId"
        class="cursor-pointer rounded-full transition-smooth"
        :class="
          place.placeId === selectedPlaceId
            ? `bg-[var(--color-accent-soft)] text-copy ring-1 ring-[var(--color-accent)] ${props.compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`
            : `bg-white/5 text-[var(--color-copy-dim)] ${props.compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`
        "
        @click="
          selectedPlaceId = place.placeId;
          focusPlace();
        "
      >
        {{ place.name }} <span class="text-xs opacity-60">· {{ place.placeType }}</span>
      </div>
    </div>
  </div>
</template>
