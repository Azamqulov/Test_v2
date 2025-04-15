<template>
  <div class="test-selection">
    <h1>Testni Tanlang</h1>
    
    <!-- Xatolik xabari -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="retryLastAction" class="retry-button">Qayta urinish</button>
    </div>
    
    <div class="selections">
      <!-- Fan tanlash -->
      <div class="selection-group">
        <label for="subject">Fan</label>
        <select
          id="subject"
          v-model="selectedFan"
          @change="getDarajalar"
          :class="{ error: submitted && !selectedFan }"
        >
          <option value="" disabled>Fanlarni Tanlang</option>
          <option v-for="fan in Fanlar" :key="fan.id" :value="fan">
            {{ fan.id }}
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
          :disabled="!selectedFan"
        >
          <option value="" disabled>Darajangizni tanlang</option>
          <option v-for="daraja in darajalar" :key="daraja" :value="daraja">
            {{ daraja }}
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
          :disabled="!selectedDaraja"
        >
          <option value="" disabled>Test sonini tanlang</option>
          <option v-for="number in TestNumber" :key="number" :value="number">
            {{ number }}
          </option>
        </select>
      </div>
    </div>

    <!-- Start Button -->
    <div class="select-start">
      <button class="start-button" @click="startTest" :disabled="isLoading || !canStartTest">
        <span v-if="!isLoading">Testni Boshlash</span>
        <span v-else class="loader"></span>
      </button>
    </div>
  </div>
</template>

<script>
import { db } from '../config/firebase';
import { collection, doc, getDocs, query, limit } from 'firebase/firestore';

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
      tests: [],
      error: null,
      lastAction: null
    };
  },
  computed: {
    canStartTest() {
      return this.selectedFan && this.selectedDaraja && this.selectedQuantity;
    }
  },
  methods: {
    async fetchFanlar() {
      try {
        this.isLoading = true;
        this.error = null;
        this.lastAction = 'fetchFanlar';
        
        const querySnapshot = await getDocs(collection(db, 'subjects'));
        this.Fanlar = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        this.isLoading = false;
      } catch (error) {
        console.error('Xatolik Fanlarni yuklashda:', error);
        this.error = `Fanlarni yuklashda xatolik: ${error.message}`;
        this.isLoading = false;
      }
    },
    async getDarajalar() {
      try {
        if (!this.selectedFan) return;

        this.isLoading = true;
        this.error = null;
        this.lastAction = 'getDarajalar';
        
        this.darajalar = [];
        this.selectedDaraja = '';
        this.selectedQuantity = '';
        
        const fanRef = doc(db, 'subjects', this.selectedFan.id);
        const collections = await getDocs(collection(fanRef, 'levels'));
        this.darajalar = collections.docs.map((doc) => doc.id);
        
        this.isLoading = false;
      } catch (error) {
        console.error('Xatolik Darajalarni yuklashda:', error);
        this.error = `Darajalarni yuklashda xatolik: ${error.message}`;
        this.isLoading = false;
      }
    },
    async fetchTests() {
      try {
        this.isLoading = true;
        this.error = null;
        this.lastAction = 'fetchTests';
        
        const fanRef = doc(db, 'subjects', this.selectedFan.id);
        const levelRef = doc(fanRef, 'levels', this.selectedDaraja);
        
        // Testlar kolleksiyasidan ma'lumotlarni olish
        const testsQuery = query(
          collection(levelRef, 'tests'), 
          limit(parseInt(this.selectedQuantity))
        );
        
        const testsSnapshot = await getDocs(testsQuery);
        
        if (testsSnapshot.empty) {
          this.error = 'Bu daraja uchun testlar topilmadi!';
          this.isLoading = false;
          return false;
        }
        
        this.tests = testsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        this.isLoading = false;
        return true;
      } catch (error) {
        console.error('Xatolik Testlarni yuklashda:', error);
        this.error = `Testlarni yuklashda xatolik: ${error.message}`;
        this.isLoading = false;
        return false;
      }
    },
    async startTest() {
      this.submitted = true;

      if (!this.canStartTest) {
        return;
      }

      const testsLoaded = await this.fetchTests();
      
      if (!testsLoaded) {
        return;
      }

      // Test ma'lumotlarini tayyorlash
      const testData = {
        fan: this.selectedFan.id,
        testSoni: this.selectedQuantity,
        daraja: this.selectedDaraja,
        testlar: this.tests
      };

      // Test sahifasiga o'tish
      this.$router.push({
        name: 'testPage',
        params: { testData: JSON.stringify(testData) },
      });
    },
    retryLastAction() {
      if (this.lastAction === 'fetchFanlar') {
        this.fetchFanlar();
      } else if (this.lastAction === 'getDarajalar') {
        this.getDarajalar();
      } else if (this.lastAction === 'fetchTests') {
        this.fetchTests();
      }
    }
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

.error-message {
  padding: 1rem;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  color: #c62828;
}

.retry-button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.retry-button:hover {
  background-color: #d32f2f;
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

select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
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