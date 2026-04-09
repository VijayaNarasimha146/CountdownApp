import { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { docRef, saveDate } from "./firebase";
import "./App.css";

const quotes = [
  "Your future is created by what you do today.",
  "Small steps today, big results tomorrow.",
  "Discipline beats motivation.",
  "Stay focused. You are closer than you think.",
];

export default function App() {
  const [date, setDate] = useState("");
  const [target, setTarget] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [quote, setQuote] = useState("");
  const [savedDate, setSavedDate] = useState("");

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const remoteDate = snapshot.data().date;
      if (!remoteDate) return;

      setSavedDate(remoteDate);
      setDate(remoteDate);
      setTarget(new Date(remoteDate));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!target) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Time reached!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

      if (days < 30) {
        setTimeLeft(`${days} days ${hours} hours`);
      } else {
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        setTimeLeft(`${months} months ${remainingDays} days ${hours} hours`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const handleSubmit = async () => {
    if (!date) {
      alert("Please select a date");
      return;
    }

    const selected = new Date(date);
    if (selected <= new Date()) {
      alert("Please select a future date");
      return;
    }

    if (date === savedDate) {
      setTarget(selected);
      return;
    }

    await saveDate(date);
    setSavedDate(date);
    setTarget(selected);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Future Countdown Planner</h1>

      <div className="card">
        <label className="field-label" htmlFor="target-date">
          Select Target Date
        </label>
        <input
          id="target-date"
          className="date-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button className="set-date-button" onClick={handleSubmit}>
          Set Date
        </button>
      </div>

      {target && (
        <div className="countdown">
          <h2>{timeLeft}</h2>
        </div>
      )}

      <div className="quote">
        <p>"{quote}"</p>
      </div>
    </div>
  );
}
