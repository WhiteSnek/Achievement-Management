import React, { useState } from 'react';
import axios from 'axios';

const Requests = ({ requests }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleOpenRequest = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseRequest = () => {
    setSelectedRequest(null);
  };

  const handleAcceptRequest = () => {
    console.log('Request Accepted:', selectedRequest);
    sendNotification();
    // Add your accept logic here
    // setSelectedRequest(null);
  };

  const handleRejectRequest = () => {
    console.log('Request Rejected:', selectedRequest);
    // Add your reject logic here
    setSelectedRequest(null);
  };

  const sendNotification = async () => {
    const message = "Congratulations, your achievement Code Cubicles hackathon held on 12/03/24 at Bhagwan Parshuram Institute of Technology has been verified by the Mentor"
    const user = '03520802722'
    const mentor = '12345'
    try {
      const response = await axios.post('https://amgmt.onrender.com/api/add-notification',{user,message,mentor})
      console.log(response)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Requests</h1>
      <div className="grid grid-cols-1 gap-6">
        {requests.map((request, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md rounded-lg p-6 cursor-pointer transform hover:scale-105 transition-transform duration-300"
            onClick={() => handleOpenRequest(request)}
            style={{ width: '70%', margin: 'auto' }} // Adjusted width and centered horizontally
          >
            <h2 className="text-xl font-semibold text-white mb-2">{request.title}</h2>
            <p className="text-white"><strong>Mentor:</strong> Aditya Gaur</p>
            <p className="text-white"><strong>Enrollment Number:</strong> {request.enrollmentNumber}</p>
            <p className="text-white text-right"><strong>Date:</strong> {request.date}</p>
            <p className="text-white text-right"><strong>Event Name:</strong> {request.eventName}</p>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full transform scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{selectedRequest.title}</h2>
            <p className="text-gray-600 mb-6">{selectedRequest.description}</p>
            <div className="mb-6">
              <p className="text-gray-800 mb-2"><strong>Mentor:</strong> Aditya Gaur</p>
              <p className="text-gray-800 mb-2"><strong>Enrollment Number:</strong> {selectedRequest.enrollmentNumber}</p>
              <p className="text-gray-800 mb-2"><strong>Date:</strong> {selectedRequest.date}</p>
              <p className="text-gray-800 mb-2"><strong>Event Name:</strong> {selectedRequest.eventName}</p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
                onClick={handleAcceptRequest}
              >
                Accept
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
                onClick={handleRejectRequest}
              >
                Reject
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300"
                onClick={handleCloseRequest}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;

