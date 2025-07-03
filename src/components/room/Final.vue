<template>
    <div>
      <a href="https://vite.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
    </div>
  </template>
  
  <script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  roomData: { type: Object, required: true }
});

// Computed properties
const players = computed(() => props.roomData.players || []);
const finalStats = computed(() => {
  return players.value.map(player => ({
    name: player.name,
    score: player.score || 0
  })).sort((a, b) => b.score - a.score);
});
  </script>
  
  <template>
    <div class="min-h-screen p-6">
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="text-center bg-white rounded-lg shadow-lg p-6">
          <h1 class="text-3xl font-headline text-primary mb-2">
            Resultados Finales
          </h1>
        </div>
  
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold text-primary mb-4">Clasificación</h2>
          <ul>
            <li v-for="(player, index) in finalStats" :key="index" class="py-2">
              {{ index + 1 }}. {{ player.name }} - {{ player.score }} puntos
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>