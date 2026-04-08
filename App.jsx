import { useEffect, useState } from "react";
import { saveDate, loadDate } from "./firebase";

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

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    loadDate().then((d) => {
      if (d) setTarget(new Date(d));
    });
  }, []);

  useEffect(() => {
    if (!target) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Time reached 🎉");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff / (1000 * 60 * 60)) % 24
      );

      if (days < 30) {
        setTimeLeft(`${days} days ${hours} hours`);
      } else {
        setTimeLeft(`${Math.floor(days / 30)} months ${days % 30} days`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [target]);

  const handleSubmit = async () => {
    const selected = new Date(date);
    if (selected <= new Date()) {
      alert("Please select a future date");
      return;
    }

    await saveDate(date);
    setTarget(selected);
  };

  return (
    <div style={styles.container}>
      <h1>⏳ Future Countdown Planner</h1>

      <div style={styles.card}>
        <label>Select Target Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={handleSubmit}>Set Date</button>
      </div>

      {target && (
        <div style={styles.countdown}>
          <h2>{timeLeft}</h2>
        </div>
      )}

      <div style={styles.quote}>
        <p>"{quote}"</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    fontFamily: "Arial",
    padding: "40px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    minHeight: "100vh",
    color: "white",
  },
  card: {
    background: "white",
    color: "black",
    padding: "20px",
    borderRadius: "10px",
    margin: "20px auto",
    width: "300px",
  },
  countdown: {
    fontSize: "24px",
    marginTop: "20px",
  },
  quote: {
    marginTop: "40px",
    fontStyle: "italic",
    background: "rgba(255,255,255,0.2)",
    padding: "15px",
    borderRadius: "10px",
  },
};