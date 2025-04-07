<template>
  <div class="edit-profile">
    <h1>Edit Profile</h1>
    <form @submit.prevent="saveProfile">
      <div class="form-group">
        <label for="username">User Name</label>
        <input type="text" id="username" v-model="profile.username" />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <div class="password-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="profile.password"
            :class="{ error: passwordError }"
            @input="validatePassword"
          />
          <i
            :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
            @click="togglePasswordVisibility"
            id="toggle-password-icon"
          ></i>
        </div>
        <span class="error-message" v-if="passwordError">{{
          passwordError
        }}</span>
      </div>

      <p class="hintText">* Password o'zgaradi faqat kiritilgan bo'lsa</p>

      <button type="submit" :disabled="loading">
        <span v-if="loading">Saving...</span>
        <span v-else>Save</span>
      </button>
    </form>
  </div>
</template>

<script>
import { getAuth, updatePassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase.js';

export default {
  data() {
    return {
      profile: {
        username: '',
        password: '',
      },
      showPassword: false,
      loading: false,
      passwordError: '',
    };
  },
  async mounted() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.profile.username = data.username || '';
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    validatePassword() {
      if (this.profile.password && this.profile.password.length < 6) {
        this.passwordError = 'Password must be at least 6 characters';
      } else {
        this.passwordError = '';
      }
    },
    async saveProfile() {
      if (this.loading) return;
      if (this.passwordError) return;

      this.loading = true;
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          alert('User not logged in');
          return;
        }

        // Use setDoc with merge: true instead of updateDoc
        // This will create the document if it doesn't exist
        await setDoc(doc(db, 'users', user.uid), {
          username: this.profile.username,
          updatedAt: new Date()
        }, { merge: true });

        // Update Firebase Auth Profile
        await updateProfile(user, {
          displayName: this.profile.username,
        });

        if (this.profile.password) {
          await updatePassword(user, this.profile.password);
        }

        alert('Profil yangilandi!');
      } catch (err) {
        console.error('Error updating profile:', err);
        alert('Profilni yangilashda xatolik: ' + err.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.edit-profile {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 90%; /* Responsiv bo'lishi uchun */
}

.edit-profile h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  border-color: #007bff;
  outline: none;
}

button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.password-wrapper {
  position: relative;
  width: 100%;
}

.password-wrapper input {
  width: 100%;
  padding-right: 2.5rem; /* O'ng tomonda ikonka uchun joy */
}

#toggle-password-icon {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.2rem;
  color: #007bff;
  transition: color 0.3s;
}

#toggle-password-icon:hover {
  color: #0056b3;
}

.hintText {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 1rem;
}

.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

@media (max-width: 500px) {
  .edit-profile {
    padding: 1rem;
  }

  button {
    padding: 0.6rem;
    font-size: 0.95rem;
  }
}
</style>