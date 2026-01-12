import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Config - Reads from environment variables
// Run with: node --env-file=.env scripts/check_usage.js
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUsage() {
    console.log("Fetching current usage Stats...");
    try {
        const docRef = doc(db, "usage", "vton_daily");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("\n--------------------------------");
            console.log(`📅 Date:  ${data.date}`);
            console.log(`🔢 Count: ${data.count} / 10`);
            console.log("--------------------------------\n");
        } else {
            console.log("No usage data found for today yet (Count: 0).");
        }
    } catch (error) {
        console.error("Error fetching usage:", error.message);
    }
}

checkUsage();
