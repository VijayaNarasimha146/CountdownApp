import { useEffect, useState } from "react";
import { loadDate, saveDate, subscribeToDate } from "./firebase";
import "./App.css";

const quotes = [
  "Your future is created by what you do today.",
  "Small steps today, big results tomorrow.",
  "Discipline beats motivation.",
  "Stay focused. You are closer than you think.",
];
const LOCAL_DATE_KEY = "countdown_target_date";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default function App() {
  const [date, setDate] = useState("");
  const [target, setTarget] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [quote, setQuote] = useState("");
  const [savedDate, setSavedDate] = useState("");

  const toTargetDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  };

  const persistDateLocally = (dateString) => {
    try {
      localStorage.setItem(LOCAL_DATE_KEY, dateString);
    } catch {
      // ignore localStorage failures
    }
  };

  const readLocalDate = () => {
    try {
      const localDate = localStorage.getItem(LOCAL_DATE_KEY);
      return DATE_PATTERN.test(localDate || "") ? localDate : "";
    } catch {
      return "";
    }
  };

  const applyDate = (nextDate) => {
    if (!DATE_PATTERN.test(nextDate || "")) return;

    setSavedDate(nextDate);
    setDate(nextDate);
    setTarget(toTargetDate(nextDate));
    persistDateLocally(nextDate);
  };

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  useEffect(() => {
    let mounted = true;
    const localDate = readLocalDate();

    if (localDate) {
      applyDate(localDate);
    }

    loadDate()
      .then((remoteDate) => {
        if (!mounted) return;

        if (remoteDate) {
          applyDate(remoteDate);
          return;
        }

        if (localDate) {
          saveDate(localDate).catch(() => {
            // keep running with local value even if sync fails
          });
        }
      })
      .catch(() => {
        // local fallback already applied above
      });

    const unsubscribe = subscribeToDate((remoteDate) => {
      if (!mounted) return;
      applyDate(remoteDate);
    }, () => {
      // keep app usable with local date if realtime sync fails
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
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

    const selected = toTargetDate(date);
    if (selected <= new Date()) {
      alert("Please select a future date");
      return;
    }

    applyDate(date);

    if (date === savedDate) {
      return;
    }

    try {
      await saveDate(date);
    } catch {
      alert("Date saved locally, but cloud sync failed. Check internet/Firestore rules.");
    }
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
