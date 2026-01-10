import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Config from your .env (Hardcoded for this script usage)
const firebaseConfig = {
    apiKey: "AIzaSyBVF6qA54mk3J5XuWOEZ7PBRkL8xQYObOA",
    authDomain: "website-2b770.firebaseapp.com",
    projectId: "website-2b770",
    storageBucket: "website-2b770.firebasestorage.app",
    messagingSenderId: "690710287858",
    appId: "1:690710287858:web:47b4865bbbd152858a076b"
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
