// @ts-nocheck
import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBLtYoA8wm-MuDgOKAWbrngvjZdjv3ssG4",
  authDomain: "legtransdz.firebaseapp.com",
  projectId: "legtransdz",
  storageBucket: "legtransdz.firebasestorage.app",
  messagingSenderId: "552201413692",
  appId: "1:552201413692:web:cf8f1eb86ac885c85a8f39",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function test() {
  try {
    console.log("Sending...");
    await sendPasswordResetEmail(auth, "kayiv71965@hilostar.com", {
      url: "https://legtransdz.com/auth",
      handleCodeInApp: false,
    });
    console.log("Success");
  } catch (e: any) {
    console.error("Error code:", e.code);
    console.error("Error message:", e.message);
  }
}

test();
