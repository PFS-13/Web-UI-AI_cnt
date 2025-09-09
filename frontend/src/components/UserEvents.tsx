import { useEffect, useState } from "react";

export default function UserEvents() {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:4000/events");

    eventSource.onmessage = (e) => {
      setEvents((prev) => [...prev, e.data]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h2>Real-time User Events</h2>
      <ul>
        {events.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
