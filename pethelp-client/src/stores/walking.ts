import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { WalkingRequest, Match } from '@/types/walking';

export const useWalkingStore = defineStore('walking', () => {
  const nearbyRequests = ref<WalkingRequest[]>([]);
  const myRequests = ref<WalkingRequest[]>([]);
  const myApplications = ref<Match[]>([]);
  const currentDetail = ref<WalkingRequest | null>(null);
  const activeMatch = ref<Match | null>(null);
  const walkLocations = ref<Array<{ lat: number; lng: number; timestamp: string }>>([]);
  const walkDistance = ref(0);
  const walkDuration = ref(0);
  const isTracking = ref(false);

  const filters = ref({
    radius: 5,
    date: '',
    status: '',
  });

  function setFilters(f: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...f };
  }

  function setCurrentDetail(request: WalkingRequest | null) {
    currentDetail.value = request;
  }

  function addLocation(lat: number, lng: number, timestamp: string) {
    walkLocations.value.push({ lat, lng, timestamp });
  }

  function clearTracking() {
    walkLocations.value = [];
    walkDistance.value = 0;
    walkDuration.value = 0;
    isTracking.value = false;
    activeMatch.value = null;
  }

  return {
    nearbyRequests, myRequests, myApplications, currentDetail,
    activeMatch, walkLocations, walkDistance, walkDuration, isTracking,
    filters,
    setFilters, setCurrentDetail, addLocation, clearTracking,
  };
});
