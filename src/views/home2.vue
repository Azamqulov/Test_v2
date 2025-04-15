<template>
    <div class="test-selection">
      <h1>Testni Tanlang</h1>
      <div class="selections">
        <!-- Fan tanlash -->
        <div class="selection-group">
          <label for="subject">Fan</label>
          <select
            id="subject"
            v-model="selectedFan"
            @change="getTest"
            :class="{ error: submitted && !selectedFan }"
          >
            <option value="" disabled>Fanlarni Tanlang</option>
            <option v-for="fan in Fanlar" :key="fan.id" :value="fan">
              {{ fan.id }}
            </option>
          </select>
        </div>
  
        <!-- Test soni -->
        <div class="selection-group">
          <label for="quantity">Test Soni</label>
          <select
            id="quantity"
            v-model="selectedQuantity"
            :class="{ error: submitted && !selectedQuantity }"
          >
            <option value="" disabled>Test sonini tanlang</option>
            <option v-for="number in TestNumber" :key="number" :value="number">
              {{ number }}
            </option>
          </select>
        </div>
  
        <!-- Daraja -->
        <div class="selection-group">
          <label for="level">Daraja</label>
          <select
            id="level"
            v-model="selectedDaraja"
            :class="{ error: submitted && !selectedDaraja }"
          >
            <option value="" disabled>Darajangizni tanlang</option>
            <option v-for="daraja in darajalar" :key="daraja" :value="daraja">
              {{ daraja }}
            </option>
          </select>
        </div>
      </div>
  
      <!-- Start Button -->
      <div class="select-start">
        <button class="start-button" @click="startTest" :disabled="isLoading">
          <span v-if="!isLoading">Testni Boshlash</span>
          <span v-else class="loader"></span>
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { db } from '../config/firebase';
  import { collection, doc, getDocs } from 'firebase/firestore';
  
  export default {
    data() {
      return {
        Fanlar: [],
        TestNumber: ['5', '10', '15', '20', '25', '30', '35', '40', '45', '50'],
        darajalar: [],
        selectedFan: '',
        selectedDaraja: '',
        selectedQuantity: '',
        isLoading: false,
        submitted: false,
      };
    },
    methods: {
      async fetchFanlar() {
        try {
          const querySnapshot = await getDocs(collection(db, 'subjects'));
          this.Fanlar = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error) {
          console.error('Xatolik:', error);
        }
      },
      async getTest() {
        try {
          if (!this.selectedFan) return;
  
          this.darajalar = [];
          const fanRef = doc(db, 'subjects', this.selectedFan.id);
          const collections = await getDocs(collection(fanRef, 'levels'));
          this.darajalar = collections.docs.map((doc) => doc.id);
        } catch (error) {
          console.error('Xatolik:', error);
        }
      },
      startTest() {
        this.submitted = true;
  
        if (!this.selectedFan || !this.selectedQuantity || !this.selectedDaraja) {
          return;
        }
  
        this.isLoading = true;
  
        // Test ma'lumotlarini tayyorlash
        // Bu yerda test ma'lumotlarini tayyorlash va saqlash jarayonini qo'shishingiz mumkin
        const testData = {
          fan: this.selectedFan.id,
          testSoni: this.selectedQuantity,
          daraja: this.selectedDaraja,
        };
  
        // Test sahifasiga o'tish
        this.$router.push({
          name: 'testPage',
          params: { testData: JSON.stringify(testData) },
        });
      },
    },
    mounted() {
      this.fetchFanlar();
    },
  };
  </script>
  <style scoped>
  .test-selection {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 2rem;
  }
  
  .selections {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .selection-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 600;
    color: #2c3e50;
  }
  
  select {
    padding: 0.75rem;
    border: 2px solid #e1e8ed;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: white;
  }
  
  select:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  select.error {
    border-color: #dc3545;
  }
  
  .start-button {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    background: linear-gradient(145deg, #0056b3, #007bff);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .start-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
  }
  
  .start-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .loader {
    width: 20px;
    height: 20px;
    border: 3px solid white;
    border-top: 3px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 768px) {
    .test-selection {
      padding: 1rem;
    }
  
    .selections {
      grid-template-columns: 1fr;
    }
  
    select {
      width: 100%;
    }
  }
  </style>
  