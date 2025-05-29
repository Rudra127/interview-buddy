'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  BookOpen,
  User,
  Mail,
  Check,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
} from 'lucide-react';

const MockInterviewDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });

  // Form state for creating/editing sessions
  const [formData, setFormData] = useState({
    interviewType: '',
    interviewTopic: '',
    availableDates: [],
    duration: 30,
    price: 0,
    timeSlots: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    description: '',
    interviewerInfo: {
      name: '',
      bio: '',
      expertise: [],
      email: '',
    },
  });

  // Fetch interviewer's sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/mock-interviews/sessions/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSessions(response.data.sessions);
    } catch (error) {
      toast.error('Failed to fetch sessions');
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch interviewer's bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/mock-interviews/bookings/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(response.data.bookings);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sessions') {
      fetchSessions();
    } else {
      fetchBookings();
    }
  }, [activeTab]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('interviewerInfo.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        interviewerInfo: {
          ...prev.interviewerInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle array fields (expertise, availableDates, timeSlots)
  const handleArrayFieldChange = (field, value, action) => {
    if (action === 'add') {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
    } else if (action === 'remove') {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((item) => item !== value),
      }));
    }
  };

  // Create a new session
  const handleCreateSession = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/mock-interviews/sessions', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Session created successfully!');
      setShowCreateModal(false);
      fetchSessions();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create session');
      console.error('Error creating session:', error);
    }
  };

  // Update a session
  const handleUpdateSession = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/mock-interviews/sessions/${currentSession.sessionId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Session updated successfully!');
      setShowEditModal(false);
      fetchSessions();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update session');
      console.error('Error updating session:', error);
    }
  };

  // Deactivate a session
  const handleDeactivateSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to deactivate this session?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/mock-interviews/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Session deactivated successfully!');
      fetchSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate session');
      console.error('Error deactivating session:', error);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      interviewType: '',
      interviewTopic: '',
      availableDates: [],
      duration: 30,
      price: 0,
      timeSlots: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      description: '',
      interviewerInfo: {
        name: '',
        bio: '',
        expertise: [],
        email: '',
      },
    });
  };

  // Open edit modal with session data
  const openEditModal = (session) => {
    setCurrentSession(session);
    setFormData({
      interviewType: session.interviewType,
      interviewTopic: session.interviewTopic,
      availableDates: session.availableDates,
      duration: session.duration,
      price: session.price,
      timeSlots: session.timeSlots,
      timezone: session.timezone,
      description: session.description,
      interviewerInfo: session.interviewerInfo,
    });
    setShowEditModal(true);
  };

  // Filter sessions based on filters
  const filteredSessions = sessions.filter((session) => {
    // Status filter
    if (filters.status !== 'all' && session.status !== filters.status) {
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

  // Filter bookings based on status
  const filteredBookings = bookings.filter((booking) => {
    if (filters.status !== 'all' && booking.status !== filters.status) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-400">Mock Interview Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              <Plus size={18} className="mr-2" />
              Create Session
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              My Sessions
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              Bookings
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
              placeholder={`Search ${activeTab === 'sessions' ? 'sessions' : 'bookings'}...`}
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
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all" className="bg-gray-700">
                  All Statuses
                </option>
                {activeTab === 'sessions' ? (
                  <>
                    <option value="active" className="bg-gray-700">
                      Active
                    </option>
                    <option value="inactive" className="bg-gray-700">
                      Inactive
                    </option>
                  </>
                ) : (
                  <>
                    <option value="booked" className="bg-gray-700">
                      Booked
                    </option>
                    <option value="completed" className="bg-gray-700">
                      Completed
                    </option>
                    <option value="cancelled" className="bg-gray-700">
                      Cancelled
                    </option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : activeTab === 'sessions' ? (
          <div className="mt-8">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-600" />
                <h3 className="mt-2 text-lg font-medium text-gray-300">No sessions found</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Get started by creating a new mock interview session.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus size={16} className="-ml-1 mr-2" />
                    Create Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="bg-gray-800 overflow-hidden shadow rounded-lg"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-blue-400">
                          {session.interviewType} Interview
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            session.status === 'active'
                              ? 'bg-blue-900 text-blue-300'
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">{session.interviewTopic}</p>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex items-start">
                          <Calendar size={16} className="text-gray-500 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-300">
                              {session.availableDates.length} dates
                            </p>
                            <p className="text-xs text-gray-500">Available</p>
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
                        <div className="flex items-start">
                          <DollarSign size={16} className="text-gray-500 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-300">${session.price}</p>
                            <p className="text-xs text-gray-500">Price</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <User size={16} className="text-gray-500 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-300">
                              {
                                session.bookedSlots.filter((slot) => slot.status === 'booked')
                                  .length
                              }
                            </p>
                            <p className="text-xs text-gray-500">Bookings</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex space-x-3">
                        <button
                          onClick={() => openEditModal(session)}
                          className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit size={16} className="-ml-0.5 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeactivateSession(session.sessionId)}
                          className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 size={16} className="-ml-0.5 mr-2" />
                          Deactivate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <User size={48} className="mx-auto text-gray-600" />
                <h3 className="mt-2 text-lg font-medium text-gray-300">No bookings found</h3>
                <p className="mt-1 text-sm text-gray-400">
                  When candidates book your sessions, they'll appear here.
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
                        Candidate
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Type
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
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                              <User size={20} className="text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-300">
                                {booking.userName || 'Anonymous'}
                              </div>
                              <div className="text-sm text-gray-500">{booking.userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{booking.interviewType}</div>
                          <div className="text-sm text-gray-500">{booking.interviewTopic}</div>
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
                            <button className="text-blue-400 hover:text-blue-300 mr-3">
                              Confirm
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

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-blue-400 mb-4">
                  Create New Mock Interview Session
                </h3>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="interviewType"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Interview Type
                    </label>
                    <select
                      id="interviewType"
                      name="interviewType"
                      value={formData.interviewType}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="" className="bg-gray-700">
                        Select a type
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

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="interviewTopic"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Interview Topic
                    </label>
                    <input
                      type="text"
                      name="interviewTopic"
                      id="interviewTopic"
                      value={formData.interviewTopic}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-300">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      id="duration"
                      min="15"
                      max="120"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300">
                      Price (USD)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-300">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="America/New_York" className="bg-gray-700">
                        Eastern Time (ET)
                      </option>
                      <option value="America/Chicago" className="bg-gray-700">
                        Central Time (CT)
                      </option>
                      <option value="America/Denver" className="bg-gray-700">
                        Mountain Time (MT)
                      </option>
                      <option value="America/Los_Angeles" className="bg-gray-700">
                        Pacific Time (PT)
                      </option>
                      <option value="UTC" className="bg-gray-700">
                        UTC
                      </option>
                    </select>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-300">
                      Available Dates
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="date"
                        className="focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (e.target.value) {
                              handleArrayFieldChange('availableDates', e.target.value, 'add');
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          if (input.value) {
                            handleArrayFieldChange('availableDates', input.value, 'add');
                            input.value = '';
                          }
                        }}
                      >
                        Add Date
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.availableDates.map((date, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300"
                        >
                          {new Date(date).toLocaleDateString()}
                          <button
                            type="button"
                            className="ml-1.5 inline-flex text-blue-400 hover:text-blue-300 focus:outline-none"
                            onClick={() => handleArrayFieldChange('availableDates', date, 'remove')}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-300">Time Slots</label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="time"
                        className="focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (e.target.value) {
                              handleArrayFieldChange('timeSlots', e.target.value, 'add');
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          if (input.value) {
                            handleArrayFieldChange('timeSlots', input.value, 'add');
                            input.value = '';
                          }
                        }}
                      >
                        Add Time
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.timeSlots.map((time, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300"
                        >
                          {time}
                          <button
                            type="button"
                            className="ml-1.5 inline-flex text-green-400 hover:text-green-300 focus:outline-none"
                            onClick={() => handleArrayFieldChange('timeSlots', time, 'remove')}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-6 border-t border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-300">Interviewer Information</h4>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="interviewerInfo.name"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="interviewerInfo.name"
                      id="interviewerInfo.name"
                      value={formData.interviewerInfo.name}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="interviewerInfo.email"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Your Email
                    </label>
                    <input
                      type="email"
                      name="interviewerInfo.email"
                      id="interviewerInfo.email"
                      value={formData.interviewerInfo.email}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="interviewerInfo.bio"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Your Bio
                    </label>
                    <textarea
                      id="interviewerInfo.bio"
                      name="interviewerInfo.bio"
                      rows={2}
                      value={formData.interviewerInfo.bio}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-300">
                      Your Expertise
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="text"
                        className="focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                        placeholder="e.g. JavaScript, System Design"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (e.target.value) {
                              handleArrayFieldChange(
                                'interviewerInfo.expertise',
                                e.target.value,
                                'add',
                              );
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          if (input.value) {
                            handleArrayFieldChange('interviewerInfo.expertise', input.value, 'add');
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.interviewerInfo.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900 text-purple-300"
                        >
                          {skill}
                          <button
                            type="button"
                            className="ml-1.5 inline-flex text-purple-400 hover:text-purple-300 focus:outline-none"
                            onClick={() =>
                              handleArrayFieldChange('interviewerInfo.expertise', skill, 'remove')
                            }
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCreateSession}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Create Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {showEditModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-blue-400 mb-4">
                  Edit Mock Interview Session
                </h3>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="interviewType"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Interview Type
                    </label>
                    <select
                      id="interviewType"
                      name="interviewType"
                      value={formData.interviewType}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
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

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="interviewTopic"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Interview Topic
                    </label>
                    <input
                      type="text"
                      name="interviewTopic"
                      id="interviewTopic"
                      value={formData.interviewTopic}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-300">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      id="duration"
                      min="15"
                      max="120"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300">
                      Price (USD)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-300">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="America/New_York" className="bg-gray-700">
                        Eastern Time (ET)
                      </option>
                      <option value="America/Chicago" className="bg-gray-700">
                        Central Time (CT)
                      </option>
                      <option value="America/Denver" className="bg-gray-700">
                        Mountain Time (MT)
                      </option>
                      <option value="America/Los_Angeles" className="bg-gray-700">
                        Pacific Time (PT)
                      </option>
                      <option value="UTC" className="bg-gray-700">
                        UTC
                      </option>
                    </select>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-300">
                      Available Dates.
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="date"
                        className="focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (e.target.value) {
                              handleArrayFieldChange('availableDates', e.target.value, 'add');
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          if (input.value) {
                            handleArrayFieldChange('availableDates', input.value, 'add');
                            input.value = '';
                          }
                        }}
                      >
                        Add Date
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.availableDates.map((date, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300"
                        >
                          {new Date(date).toLocaleDateString()}
                          <button
                            type="button"
                            className="ml-1.5 inline-flex text-blue-400 hover:text-blue-300 focus:outline-none"
                            onClick={() => handleArrayFieldChange('availableDates', date, 'remove')}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-300">Time Slots</label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="time"
                        className="focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (e.target.value) {
                              handleArrayFieldChange('timeSlots', e.target.value, 'add');
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          if (input.value) {
                            handleArrayFieldChange('timeSlots', input.value, 'add');
                            input.value = '';
                          }
                        }}
                      >
                        Add Time
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.timeSlots.map((time, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300"
                        >
                          {time}
                          <button
                            type="button"
                            className="ml-1.5 inline-flex text-green-400 hover:text-green-300 focus:outline-none"
                            onClick={() => handleArrayFieldChange('timeSlots', time, 'remove')}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleUpdateSession}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Update Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewDashboard;
