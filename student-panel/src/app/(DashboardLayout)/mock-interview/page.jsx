'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  Mail,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

const StudentBookingDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    interviewType: 'all',
    search: '',
  });
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    notes: '',
  });

  // Fetch available sessions
  const fetchAvailableSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/mock-interviews/sessions/available');
      setSessions(response.data.sessions);
    } catch (error) {
      toast.error('Failed to fetch available sessions');
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student's bookings
  const fetchStudentBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/mock-interviews/bookings/me');
      setBookings(response.data.bookings);
    } catch (error) {
      toast.error('Failed to fetch your bookings');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'available') {
      fetchAvailableSessions();
    } else {
      fetchStudentBookings();
    }
  }, [activeTab]);

  // Handle booking form changes
  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open booking modal with session data
  const openBookingModal = (session) => {
    setSelectedSession(session);
    setBookingForm({
      date: '',
      time: '',
      notes: '',
    });
    setShowBookingModal(true);
  };

  // Open details modal
  const openDetailsModal = (session) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  // Book a session
  const handleBookSession = async () => {
    try {
      if (!bookingForm.date || !bookingForm.time) {
        toast.error('Please select both date and time');
        return;
      }

      const bookingData = {
        date: bookingForm.date,
        time: bookingForm.time,
        notes: bookingForm.notes,
      };

      await axios.post(`/mock-interviews/sessions/${selectedSession.sessionId}/book`, bookingData);

      toast.success('Session booked successfully!');
      setShowBookingModal(false);
      fetchAvailableSessions();
      fetchStudentBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book session');
      console.error('Error booking session:', error);
    }
  };

  // Cancel a booking
  const handleCancelBooking = async (booking) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await axios.post(`/mock-interviews/sessions/${booking.sessionId}/cancel`, {
        date: booking.date,
        time: booking.time,
      });

      toast.success('Booking cancelled successfully!');
      fetchStudentBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
      console.error('Error cancelling booking:', error);
    }
  };

  // Filter available sessions
  const filteredSessions = sessions.filter((session) => {
    // Interview type filter
    if (filters.interviewType !== 'all' && session.interviewType !== filters.interviewType) {
      return false;
    }

    // Search filter
    if (
      filters.search &&
      !session.interviewTopic.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    if (filters.interviewType !== 'all' && booking.interviewType !== filters.interviewType) {
      return false;
    }
    return true;
  });

  // Get available slots for a session
  const getAvailableSlots = (session) => {
    const availableSlots = [];

    session.availableDates.forEach((date) => {
      const dateStr = new Date(date).toISOString().split('T')[0];
      session.timeSlots.forEach((time) => {
        const isBooked = session.bookedSlots?.some(
          (slot) =>
            slot.date.toISOString().split('T')[0] === dateStr &&
            slot.time === time &&
            slot.status === 'booked',
        );

        if (!isBooked) {
          availableSlots.push({
            date: dateStr,
            time,
          });
        }
      });
    });

    return availableSlots;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-blue-400">Mock Interview Sessions</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              Available Sessions
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-bookings'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              My Bookings
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative rounded-md shadow-sm w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab === 'available' ? 'sessions' : 'bookings'}...`}
              className="bg-gray-700 text-gray-200 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-600 rounded-md py-2"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter size={16} className="text-gray-500 mr-2" />
              <select
                className="bg-gray-700 text-gray-200 focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-10 py-2 text-base border-gray-600 rounded-md sm:text-sm"
                value={filters.interviewType}
                onChange={(e) => setFilters({ ...filters, interviewType: e.target.value })}
              >
                <option value="all" className="bg-gray-700">
                  All Types
                </option>
                <option value="technical" className="bg-gray-700">
                  Technical
                </option>
                <option value="behavioral" className="bg-gray-700">
                  Behavioral
                </option>
                <option value="system-design" className="bg-gray-700">
                  System Design
                </option>
                <option value="case-study" className="bg-gray-700">
                  Case Study
                </option>
                <option value="resume-review" className="bg-gray-700">
                  Resume Review
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : activeTab === 'available' ? (
          <div className="mt-8">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-600" />
                <h3 className="mt-2 text-lg font-medium text-gray-300">No sessions available</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Check back later for new mock interview sessions.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSessions.map((session) => {
                  const availableSlots = getAvailableSlots(session);
                  return (
                    <div
                      key={session.sessionId}
                      className="bg-gray-800 overflow-hidden shadow rounded-lg"
                    >
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg leading-6 font-medium text-blue-400">
                            {session.interviewType} Interview
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                            ${session.price}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-400">{session.interviewTopic}</p>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="flex items-start">
                            <User size={16} className="text-gray-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-300">
                                {session.interviewerInfo.name}
                              </p>
                              <p className="text-xs text-gray-500">Interviewer</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Clock size={16} className="text-gray-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-300">
                                {session.duration} mins
                              </p>
                              <p className="text-xs text-gray-500">Duration</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-gray-400">
                            {availableSlots.length} available time slots
                          </p>
                        </div>

                        <div className="mt-5 flex space-x-3">
                          <button
                            onClick={() => openDetailsModal(session)}
                            className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => openBookingModal(session)}
                            disabled={availableSlots.length === 0}
                            className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white ${
                              availableSlots.length === 0
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-600" />
                <h3 className="mt-2 text-lg font-medium text-gray-300">No bookings found</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Book a mock interview session to get started.
                </p>
              </div>
            ) : (
              <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Interview Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Interviewer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Date & Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredBookings.map((booking) => (
                      <tr key={`${booking.sessionId}-${booking.date}-${booking.time}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{booking.interviewType}</div>
                          <div className="text-sm text-gray-500">{booking.interviewTopic}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                              <User size={20} className="text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-300">
                                {booking.interviewerInfo.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.interviewerInfo.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {new Date(booking.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.time} ({booking.duration} mins)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === 'booked'
                                ? 'bg-blue-900 text-blue-300'
                                : booking.status === 'completed'
                                ? 'bg-green-900 text-green-300'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {booking.status === 'booked' && (
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              className="text-red-400 hover:text-red-300 mr-3"
                            >
                              Cancel
                            </button>
                          )}
                          <button className="text-gray-400 hover:text-gray-300">Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedSession && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-blue-400 mb-4">
                  Book Mock Interview Session
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-gray-300">Type:</span>{' '}
                    {selectedSession.interviewType}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-gray-300">Topic:</span>{' '}
                    {selectedSession.interviewTopic}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-gray-300">Interviewer:</span>{' '}
                    {selectedSession.interviewerInfo.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-gray-300">Duration:</span>{' '}
                    {selectedSession.duration} minutes
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-gray-300">Price:</span> $
                    {selectedSession.price}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-300">
                      Select Date
                    </label>
                    <select
                      id="date"
                      name="date"
                      value={bookingForm.date}
                      onChange={handleBookingFormChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select a date</option>
                      {Array.from(
                        new Set(getAvailableSlots(selectedSession).map((slot) => slot.date)),
                      ).map((date) => (
                        <option key={date} value={date} className="bg-gray-700">
                          {new Date(date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="time" className="block text-sm font-medium text-gray-300">
                      Select Time Slot
                    </label>
                    <select
                      id="time"
                      name="time"
                      value={bookingForm.time}
                      onChange={handleBookingFormChange}
                      disabled={!bookingForm.date}
                      className={`mt-1 block w-full py-2 px-3 border border-gray-600 ${
                        !bookingForm.date ? 'bg-gray-700' : 'bg-gray-700'
                      } text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    >
                      <option value="">Select a time slot</option>
                      {bookingForm.date &&
                        getAvailableSlots(selectedSession)
                          .filter((slot) => slot.date === bookingForm.date)
                          .map((slot) => (
                            <option key={slot.time} value={slot.time} className="bg-gray-700">
                              {slot.time}
                            </option>
                          ))}
                    </select>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={bookingForm.notes}
                      onChange={handleBookingFormChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                      placeholder="Any specific topics or areas you'd like to focus on?"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleBookSession}
                  disabled={!bookingForm.date || !bookingForm.time}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${
                    !bookingForm.date || !bookingForm.time
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {showDetailsModal && selectedSession && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-blue-400 mb-4">
                  Session Details
                </h3>
                <div className="mt-2 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">Interview Type</h4>
                    <p className="mt-1 text-sm text-gray-400">{selectedSession.interviewType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">Topic</h4>
                    <p className="mt-1 text-sm text-gray-400">{selectedSession.interviewTopic}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">Description</h4>
                    <p className="mt-1 text-sm text-gray-400">
                      {selectedSession.description || 'No description provided'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">Interviewer</h4>
                    <div className="mt-1 flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <User size={20} className="text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-300">
                          {selectedSession.interviewerInfo.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedSession.interviewerInfo.email}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      {selectedSession.interviewerInfo.bio || 'No bio provided'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">Expertise</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedSession.interviewerInfo.expertise.length > 0 ? (
                        selectedSession.interviewerInfo.expertise.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900 text-purple-300"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">No expertise listed</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Duration</h4>
                      <p className="mt-1 text-sm text-gray-400">
                        {selectedSession.duration} minutes
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Price</h4>
                      <p className="mt-1 text-sm text-gray-400">${selectedSession.price}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">Available Slots</h4>
                    <p className="mt-1 text-sm text-gray-400">
                      {getAvailableSlots(selectedSession).length} slots available
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {activeTab === 'available' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailsModal(false);
                      openBookingModal(selectedSession);
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Book Now
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 ${
                    activeTab === 'available' ? 'sm:ml-3' : ''
                  } sm:w-auto sm:text-sm`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBookingDashboard;
