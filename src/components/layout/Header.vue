<template>
  <header class="bg-primary text-primary-foreground shadow-md">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
      <router-link to="/" class="text-primary-foreground text-3xl font-headline font-bold hover:opacity-90 transition-opacity">
        {{ translations[language].title }}
      </router-link>
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Language Selector (using basic select for now) -->
        <div class="flex items-center gap-2">
          <Globe class="w-4 h-4 shrink-0" />
          <select
            v-model="language"
            class="w-[100px] sm:w-[120px] text-xs sm:text-sm h-9 bg-primary/80 border-primary-foreground/30 hover:bg-primary/70 focus:ring-primary-foreground text-primary-foreground"
            aria-label="Language"
          >
            <option value="en">{{ translations.en.english }}</option>
            <option value="es">{{ translations.es.spanish }}</option>
          </select>
        </div>

        <!-- Authentication Status -->
        <div v-if="isAuthenticated" class="flex items-center gap-3 sm:gap-4">
          <div class="flex items-center gap-2">
            <UserCircle size={24} class="w-4 h-4 shrink-0" />
            <span class="text-sm font-medium hidden sm:inline">{{ username }}</span>
          </div>
          <button @click="logout" class="text-primary-foreground hover:bg-primary/70 px-2 sm:px-3">
            <LogOut size={18} class="w-4 h-4 shrink-0" />
            <span class="hidden sm:inline">{{ translations[language].logout }}</span>
          </button>
        </div>
        <div v-else>
          <router-link to="/login" class="text-primary-foreground hover:bg-primary/70 px-2 sm:px-3">
            <LogIn size={18} class="w-4 h-4 shrink-0"  />
            <span class="hidden sm:inline">{{ translations[language].login }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { Globe, UserCircle, LogOut, LogIn } from 'lucide-vue-next'; // Assuming you'll use lucide-vue-next for icons

// Dummy data for now
const isAuthenticated = ref(true);
const username = ref('DummyUser');
const language = ref('en'); // Default language

const translations = {
  en: {
    title: "Lexicon",
    logout: "Logout",
    login: "Login",
    language: "Language",
    english: "English",
    spanish: "Español",
  },
  es: {
    title: "Lexicon",
    logout: "Salir",
    login: "Ingresar",
    language: "Idioma",
    english: "English",
    spanish: "Español",
  }
};

const logout = () => {
  console.log('Logout clicked');
  // Implement actual logout logic here
  isAuthenticated.value = false;
  username.value = '';
};

// Function to set language (dummy)
const setLanguage = (lang) => {
  language.value = lang;
};
</script>

<style scoped>
/* Add any component-specific styles here if needed,
   but rely mostly on Tailwind classes */
</style>