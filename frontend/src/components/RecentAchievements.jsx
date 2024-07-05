import React, { useState, useEffect } from "react";
import { IconContext } from "react-icons/lib";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import axios from "axios";
import { formatDate } from "../utililtyFunctions";
import Loader from "./Loader";

const EventCard = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 duration-300">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
        <div>
          <h3 className="text-xl font-bold">{event.name}</h3>
          <p className={`text-sm ${event.result === "winner" ? "font-bold" : "font-normal"}`}>
            {event.result}
          </p>
          <p className="text-sm">{formatDate(event.date)}</p>
          <p className="text-sm">{event.location}</p>
        </div>
        <button
          onClick={toggleOpen}
          className="p-2 rounded-full bg-white text-blue-600 hover:text-white hover:bg-blue-600 transition-colors"
        >
          <IconContext.Provider value={{ size: "24px" }}>
            {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
          </IconContext.Provider>
        </button>
      </div>
      {isOpen && (
        <div className="p-4 bg-gray-50">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <th className="text-left p-2 border border-gray-300 bg-gray-200">Name of the event:</th>
                <td className="p-2 border border-gray-300">{event.name}</td>
              </tr>
              <tr>
                <th className="text-left p-2 border border-gray-300 bg-gray-200">Date:</th>
                <td className="p-2 border border-gray-300">{formatDate(event.date)}</td>
              </tr>
              <tr>
                <th className="text-left p-2 border border-gray-300 bg-gray-200">Event Type:</th>
                <td className="p-2 border border-gray-300">{event.description}</td>
              </tr>
              <tr>
                <th className="text-left p-2 border border-gray-300 bg-gray-200">Mode:</th>
                <td className="p-2 border border-gray-300">{event.mode}</td>
              </tr>
              <tr>
                <th className="text-left p-2 border border-gray-300 bg-gray-200">Venue(or link):</th>
                <td className="p-2 border border-gray-300">{event.location}</td>
              </tr>
              <tr>
                <th className="text-left p-2 border border-gray-300 bg-gray-200">Result:</th>
                <td className="p-2 border border-gray-300">{event.result}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const RecentAchievements = ({ events, setEvents }) => {
  const [sortCriteria, setSortCriteria] = useState("A-Z");

  useEffect(() => {
    sortEvents(sortCriteria);
  }, [sortCriteria, events]);

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  const sortEvents = (criteria) => {
    let sortedEvents = [...events];
    switch (criteria) {
      case "A-Z":
        sortedEvents.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Z-A":
        sortedEvents.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Newest":
        sortedEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "Oldest":
        sortedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      default:
        break;
    }
    if (JSON.stringify(sortedEvents) !== JSON.stringify(events)) {
      setEvents(sortedEvents);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-purple-300 to-blue-300 rounded-lg shadow-md">
      <div className="flex justify-between items-center flex-col md:flex-row mb-6">
        <h1 className="text-4xl font-bold text-gray-800 py-6">Recent Achievements</h1>
        <select
          value={sortCriteria}
          onChange={handleSortChange}
          className="outline-none p-2 border-b-2 border-indigo-600 bg-white text-indigo-600 rounded-md mt-4 md:mt-0"
        >
          <option value="A-Z">A-Z</option>
          <option value="Z-A">Z-A</option>
          <option value="Newest">Newest</option>
          <option value="Oldest">Oldest</option>
        </select>
      </div>
      <div className="flex flex-col gap-6">
        {events.length === 0 ? (
          <Loader />
        ) : (
          events.map((event, idx) => <EventCard event={event} key={idx} />)
        )}
      </div>
    </div>
  );
};

export default RecentAchievements;
