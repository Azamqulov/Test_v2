import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

async function addAdmin(username, password) {
  try {
    const docRef = await addDoc(collection(db, "admins"), {
      username: username,
      password: password,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export { addAdmin };


// service cloud.firestore {
//   match /databases/{database}/documents {
//     // Faqat adminlarga testlarni qo'shish (yuklash) huquqini berish
//     match /subjects/{subject}/levels/{level}/tests/{testId} {
//       allow read: if true; // Barchaga o'qish (read) huquqi
//       allow write: if request.auth != null && request.auth.token.admin == true; // Faqat adminlarga yozish (write) huquqi
//     }

//     // Adminlar uchun ruxsat
//     match /{document=**} {
//       allow read, write: if request.auth != null && request.auth.token.admin == true;
//     }
//   }
// }