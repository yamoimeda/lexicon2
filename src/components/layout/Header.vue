<template>
  <header class="bg-primary text-primary-foreground shadow-md">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
      <router-link to="/" class="text-primary-foreground text-3xl font-headline font-bold hover:opacity-90 transition-opacity">
        {{ currentTranslations.title }}
      </router-link>
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- lenguage Selector (using basic select for now) -->
        <div class="flex items-center justify-between 
        rounded-md border-2 px-3 py-2 ring-offset-background 
        placeholder:text-muted-foreground focus:outline-none 
        focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed 
        disabled:opacity-50 [&>span]:line-clamp-1 w-[100px] sm:w-[120px] text-xs sm:text-sm h-9 bg-primary/80 border-primary-foreground/30 hover:bg-primary/70 focus:ring-primary-foreground text-primary-foreground">
          <Globe class="w-4 h-4 shrink-0" />
          <select
            v-model="lenguage"
            class=" text-xs sm:text-sm h-8 bg-primary/80 border-primary-foreground/30 hover:bg-primary/70 focus:ring-primary-foreground text-primary-foreground"
            aria-label="lenguage"
          >
            <option value="en">{{ currentTranslations.english }}</option>
            <option value="es">{{ currentTranslations.spanish }}</option>
          </select>
        </div>

        <!-- Authentication Status -->
        <div v-if="isAuthenticated" class="flex items-center gap-3 sm:gap-4">
          <div class="flex items-center gap-2">
            <UserCircle class="w-4 h-4 shrink-0" />
            <span class="text-sm font-medium hidden sm:inline">{{ username }}</span>
          </div>
          <button @click="handleLogout" class="flex flex-row text-primary-foreground 
          hover:bg-primary/70 px-2 sm:px-3 items-center gap-2 sm:gap-2 rounded-md transition-colors">
            <LogOut class="w-4 h-4 shrink-0" />
            <span class="hidden sm:inline">{{ currentTranslations.logout }}</span>
          </button>
        </div>
        <div v-else>
          <router-link to="/login" class="flex flex-row text-primary-foreground 
          hover:bg-primary/70 px-2 sm:px-3 items-center gap-2 sm:gap-2 rounded-md transition-colors">
            <LogIn class="w-4 h-4 shrink-0" />
            <span class="hidden sm:inline">{{ currentTranslations.login }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Globe, UserCircle, LogOut, LogIn } from 'lucide-vue-next';
import { lenguage } from '../../composables/GlobalVariables';
import { useTranslations } from '../../Translations/HeaderTraducction';
import { useAuth } from '../../composables/useAuth.js';

const router = useRouter();
const currentTranslations = useTranslations;
const { isAuthenticated, username, logout: authLogout } = useAuth();

const handleLogout = async () => {
  console.log('Logout clicked');
  const success = await authLogout();
  if (success) {
    router.push('/login');
  } else {
    console.error('Error al cerrar sesión');
  }
};
</script>

<style scoped>
/* Add any component-specific styles here if needed,
   but rely mostly on Tailwind classes */
</style>