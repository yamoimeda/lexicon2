<template>
  <div class="flex flex-col min-h-screen bg-background text-foreground">
    <Header/>
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
    <!-- Optional: Add a footer component here -->
  </div>

</template>

<script>
import Header from '../components/layout/Header.vue';

export default {
  name: 'AppLayout',
  components: {
    Header,
  },
};
</script>

<style scoped>
</style>
