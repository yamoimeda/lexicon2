
import { ref,watch } from 'vue'

export const lenguage = ref(localStorage.getItem('language') || 'en')

watch(lenguage, (newLang) => {

    localStorage.setItem('language', newLang);
    console.log(`Language changed to ${newLang}`);
  });