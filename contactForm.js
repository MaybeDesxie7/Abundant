// contactForm.js
import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

const form = document.getElementById('contactForm');
const note = document.getElementById('contactNote');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  note.textContent = ""; // clear previous messages
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const company = form.company.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    note.textContent = "Please fill in all required fields.";
    return;
  }

  // Disable the button to prevent multiple clicks
  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {
    // Tiny delay to ensure Firestore module is ready
    await new Promise(res => setTimeout(res, 200));

    await addDoc(collection(db, "messages"), {
      name,
      email,
      company,
      message,
      timestamp: serverTimestamp()
    });

    note.textContent = "Message sent successfully!";
    form.reset();
  } catch (err) {
    console.error("Firestore error:", err);
    note.textContent = "Failed to send message. Please try again.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  }
});
