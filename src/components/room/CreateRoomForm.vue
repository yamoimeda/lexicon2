<template>
  <div class="w-full shadow-xl bg-white rounded-lg p-6">
    <h2 class="text-2xl font-bold text-primary flex items-center mb-2">
      <SettingsIcon class="mr-2" /> {{ T.customizeTitle }}
    </h2>
    <p class="text-gray-600 mb-6">{{ T.customizeDescription }}</p>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="font-semibold" for="roomName">{{ T.roomNameLabel }}</label>
        <input
          id="roomName"
          v-model="settings.roomName"
          :disabled="isCreating"
          required
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1"
        />
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="font-semibold flex items-center" for="numberOfRounds">
            <ListOrderedIcon class="mr-2 h-4 w-4 text-gray-500" />
            {{ T.roundsLabel }}
          </label>
          <input
            id="numberOfRounds"
            type="number"
            min="1"
            max="10"
            v-model.number="settings.numberOfRounds"
            :disabled="isCreating"
            required
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1"
          />
        </div>

        <div>
          <label class="font-semibold flex items-center" for="timePerRound">
            <ClockIcon class="mr-2 h-4 w-4 text-gray-500" />
            {{ T.timePerRoundLabel }}
          </label>
          <input
            id="timePerRound"
            type="number"
            min="30"
            max="180"
            step="10"
            v-model.number="settings.timePerRound"
            :disabled="isCreating"
            required
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1"
          />
        </div>
      </div>

      <div>
        <label class="font-semibold" for="categories">{{ T.categoriesLabel }}</label>
        <input
          id="categories"
          v-model="settings.categories"
          :placeholder="T.defaultCategoriesPlaceholder"
          :disabled="isCreating"
          required
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1"
        />
        <p class="text-xs text-gray-500 mt-1">{{ T.categoriesDescription }}</p>
      </div>

      <div>
        <label class="font-semibold flex items-center" for="language">
          <LanguagesIcon class="mr-2 h-4 w-4 text-gray-500" />
          {{ T.languageLabel }}
        </label>
        <select
          id="language"
          v-model="settings.language"
          :disabled="isCreating"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1"
        >
          <option value="English">{{ T.english }}</option>
          <option value="Spanish">{{ T.spanish }}</option>
          <option value="French">{{ T.french }}</option>
          <option value="German">{{ T.german }}</option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
          {{ T.languageDescription }}
        </p>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label class="font-semibold flex items-center" for="endRoundOnFirstSubmit">
            <ZapIcon class="mr-2 h-4 w-4 text-gray-500" />
            {{ T.endRoundOnFirstSubmitLabel }}
          </label>
          <input
            type="checkbox"
            id="endRoundOnFirstSubmit"
            v-model="settings.endRoundOnFirstSubmit"
            :disabled="isCreating"
            class="form-checkbox h-5 w-5 text-primary"
          />
        </div>
        <p class="text-xs text-gray-500 mt-1">{{ T.endRoundOnFirstSubmitDescription }}</p>
      </div>

      <button
        @click="handleSubmit"
        :disabled="isCreating"
        class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3"
      >
        <span v-if="isCreating">
          <LoaderIcon class="mr-2 h-5 w-5 animate-spin inline" />
          {{ T.creatingRoomButton }}
        </span>
        <span v-else>
          <PlusCircleIcon class="mr-2 inline" />
          {{ T.createRoomButton }}
        </span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch,onMounted } from 'vue';
import {
  SettingsIcon,
  ListOrderedIcon,
  ClockIcon,
  LanguagesIcon,
  ZapIcon,
  LoaderIcon,
  PlusCircleIcon
} from 'lucide-vue-next';
import { useCreateRoomTranslations } from '../../Translations/CreateRoomTranslation';
import { useRouter } from 'vue-router';
import { getFirestore, collection, setDoc, serverTimestamp, getDocs, query, where, doc } from 'firebase/firestore';
import '../../firebase/config.js';

const uiLanguage = 'en'; // Replace with actual user language from context
const username = ref(localStorage.getItem('username')); // Replace with actual username from context

const T = useCreateRoomTranslations;

const isCreating = ref(false);

const settings = reactive({
  roomName: `${username.value}'s Game`,
  numberOfRounds: 3,
  timePerRound: 60,
  categories: T.value.defaultCategoriesPlaceholder,
  language: 'English',
  endRoundOnFirstSubmit: false
});

watch(
  () => uiLanguage,
  (newLang) => {
    settings.language = 'English';
    settings.categories = T.value.defaultCategoriesPlaceholder;
    settings.roomName = `${username.value}'s Game`;
  }
);
const router = useRouter();
const generateUniqueRoomId = async (db) => {
  let roomId;
  let isUnique = false;

  while (!isUnique) {
    roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomRef = collection(db, 'rooms');
    const querySnapshot = await getDocs(query(roomRef, where('id', '==', roomId)));

    if (querySnapshot.empty) {
      isUnique = true;
    }
  }

  return roomId;
};

const handleSubmit = async () => {
  isCreating.value = true;
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  if (!userId || !username) {
    
    router.replace('/login');
    return;
  }

  const db = getFirestore();
  const roomId = await generateUniqueRoomId(db);

  const roomSettings = {
    roomName: settings.roomName,
    numberOfRounds: settings.numberOfRounds,
    timePerRound: settings.timePerRound,
    categories: settings.categories.split(',').map(cat => cat.trim()),
    language: settings.language,
    endRoundOnFirstSubmit: settings.endRoundOnFirstSubmit,
    admin: userId,
    currentRound: 0,
    gameStatus: 'waiting',
  };

  const roomData = {
    id: roomId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    settings: roomSettings,
    players: [
      {
        id: userId,
        name: username,
        isAdmin: true,
        score: 0,
      },
    ],
    rounds: [],
  };

  try {
    await setDoc(doc(db, 'rooms', roomId), roomData);
    
    router.push(`/game/${roomId}`);
  } catch (error) {
    
  } finally {
    isCreating.value = false;
  }
};

onMounted(() => {
  const userId = localStorage.getItem('userId');
  const storedUsername = localStorage.getItem('username');

  if (!userId || !storedUsername) {
    
    router.replace('/login');
  } else {
    username.value = storedUsername;
  }
});
</script>
