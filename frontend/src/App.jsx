import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

// --- Landing ---
function Landing() {
  return (
    <div className="relative min-h-screen w-screen flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Full-screen animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-red-900 animate-gradient"></div>

      {/* Content card */}
      <div className="relative z-10 bg-gray-800/40 backdrop-blur-md rounded-xl p-10 shadow-xl max-w-2xl">
        <h1 className="text-6xl font-extrabold text-white mb-6 drop-shadow-[0_0_20px_rgba(220,38,38,0.7)]">
          Welcome to <span className="text-red-500">BadgerPool</span>
        </h1>
        <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
          Campus ride-sharing made simple. Offer rides, join rides, and move
          around Madison together.
        </p>
        <div className="flex gap-6 justify-center">
          <Link
            to="/rides"
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-semibold transition transform hover:scale-105 shadow-lg"
          >
            Find Rides
          </Link>
          <Link
            to="/create"
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg text-white font-semibold transition transform hover:scale-105 shadow-lg"
          >
            Offer a Ride
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Login ---
function Login({ setUser }) {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem("username", name.trim());
    setUser(name.trim());
    navigate("/");
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-700 bg-gray-900 text-white rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
        />
        <button
          type="submit"
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}

// --- Find Rides ---
function FindRide() {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/rides/search")
      .then((res) => res.json())
      .then((data) => setRides(data))
      .catch((err) => console.error("Error fetching rides:", err));
  }, []);

  const joinRide = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/rides/join/${id}`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setRides((prev) =>
          prev.map((ride) =>
            ride.id === id
              ? { ...ride, seats_left: ride.seats_left - 1 }
              : ride
          )
        );
      } else {
        console.error(data.error || "Failed to join ride");
      }
    } catch (err) {
      console.error("Error joining ride:", err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-red-500 mb-6">
        Available Rides
      </h1>
      {rides.length === 0 ? (
        <p className="text-gray-400">No rides available right now.</p>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="bg-gray-800 rounded-xl p-5 shadow hover:shadow-lg transition hover:scale-[1.01] flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-lg text-white">
                  {ride.origin} → {ride.destination}
                </p>
                <p className="text-gray-400">{ride.time}</p>
                <p className="text-gray-400">{ride.driver}</p>
                <p className="text-gray-400">Seats left: {ride.seats_left}</p>
              </div>
              <button
                onClick={() => joinRide(ride.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:bg-gray-600"
                disabled={ride.seats_left <= 0}
              >
                {ride.seats_left > 0 ? "Join Ride" : "Full"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Create Ride ---
function CreateRide({ user }) {
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    time: "",
    seats_left: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "seats_left" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/rides/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, driver: user }),
      });
      const data = await res.json();

      if (res.ok) {
        setForm({ origin: "", destination: "", time: "", seats_left: 1 });
      } else {
        console.error(data.error || "Failed to create ride");
      }
    } catch (err) {
      console.error("Error creating ride:", err);
    }
  };

  if (!user) {
    return <p className="text-red-500">Please log in first to create rides.</p>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow max-w-md">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Create a Ride</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="origin"
          value={form.origin}
          onChange={handleChange}
          placeholder="Origin"
          className="w-full border border-gray-700 bg-gray-900 text-white rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
          required
        />
        <input
          type="text"
          name="destination"
          value={form.destination}
          onChange={handleChange}
          placeholder="Destination"
          className="w-full border border-gray-700 bg-gray-900 text-white rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
          required
        />
        <input
          type="text"
          name="time"
          value={form.time}
          onChange={handleChange}
          placeholder="Time (e.g. 9:00PM)"
          className="w-full border border-gray-700 bg-gray-900 text-white rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
          required
        />
        <input
          type="number"
          name="seats_left"
          value={form.seats_left}
          onChange={handleChange}
          min="1"
          className="w-full border border-gray-700 bg-gray-900 text-white rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
          required
        />
        <button
          type="submit"
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Create Ride
        </button>
      </form>
    </div>
  );
}

// --- My Rides ---
function MyRides({ user }) {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:8000/rides/myrides/${user}`)
      .then((res) => res.json())
      .then((data) => setRides(data))
      .catch((err) => console.error("Error fetching rides:", err));
  }, [user]);

  if (!user) {
    return <p className="text-red-500">Please log in to see your rides.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-red-500 mb-4">My Rides</h1>
      {rides.length === 0 ? (
        <p className="text-gray-400">You haven’t created any rides yet.</p>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="bg-gray-800 rounded-xl p-5 shadow hover:shadow-lg transition hover:scale-[1.01]"
            >
              <p className="font-bold text-lg text-white">
                {ride.origin} → {ride.destination}
              </p>
              <p className="text-gray-400">🕒 {ride.time}</p>
              <p className="text-gray-400">💺 Seats left: {ride.seats_left}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- App Wrapper ---
export default function App() {
  const [user, setUser] = useState(localStorage.getItem("username") || "");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 shadow sticky top-0 z-10 p-4 flex gap-6">
        <Link to="/" className="hover:text-red-500 transition">Home</Link>
        <Link to="/rides" className="hover:text-red-500 transition">Find Rides</Link>
        <Link to="/create" className="hover:text-red-500 transition">Create Ride</Link>
        <Link to="/myrides" className="hover:text-red-500 transition">My Rides</Link>
        <Link to="/login" className="ml-auto text-gray-400 hover:text-red-500 transition">
          {user ? `Logged in as ${user}` : "Login"}
        </Link>
      </nav>

      <Routes>
        {/* Landing: full screen, no main wrapper */}
        <Route path="/" element={<Landing />} />

        {/* Other pages wrapped in main container */}
        <Route
          path="/rides"
          element={
            <main className="max-w-3xl mx-auto p-6">
              <FindRide />
            </main>
          }
        />
        <Route
          path="/create"
          element={
            <main className="max-w-3xl mx-auto p-6">
              <CreateRide user={user} />
            </main>
          }
        />
        <Route
          path="/myrides"
          element={
            <main className="max-w-3xl mx-auto p-6">
              <MyRides user={user} />
            </main>
          }
        />
        <Route
          path="/login"
          element={
            <main className="max-w-3xl mx-auto p-6">
              <Login setUser={setUser} />
            </main>
          }
        />
      </Routes>
    </div>
  );
}
