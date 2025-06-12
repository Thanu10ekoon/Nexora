import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Search, Filter } from 'lucide-react';
import api from '../../services/api';

const SchedulesView = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const programs = ['SE', 'CS', 'IT', 'AI', 'DS'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  useEffect(() => {
    fetchSchedules();
  }, []);
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/schedules');
      if (response.data.success) {
        setSchedules(response.data.data || []);
      } else {
        console.error('Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    return (
      (!selectedDay || schedule.day_of_week === selectedDay) &&
      (!selectedProgram || schedule.program === selectedProgram) &&
      (!selectedSemester || schedule.semester === selectedSemester)
    );
  });

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getScheduleForTimeSlot = (day, time) => {
    return filteredSchedules.find(schedule => 
      schedule.day_of_week === day && 
      schedule.start_time.substring(0, 5) === time
    );
  };

  const formatTime = (time) => {
    return time.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Calendar className="mr-3 text-blue-600" />
                Class Schedules
              </h1>
              <p className="text-gray-600 mt-2">View your class timetable and room assignments</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Days</option>
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Programs</option>
                {programs.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Semesters</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  {daysOfWeek.map(day => (
                    <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getTimeSlots().map(time => (
                  <tr key={time} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {time}
                    </td>
                    {daysOfWeek.map(day => {
                      const schedule = getScheduleForTimeSlot(day, time);
                      return (
                        <td key={`${day}-${time}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule ? (
                            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                              <div className="font-semibold text-blue-900">{schedule.subject_name}</div>
                              <div className="text-blue-700 text-xs mt-1">
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  Room {schedule.room_number}
                                </div>
                                <div className="flex items-center mt-1">
                                  <User className="w-3 h-3 mr-1" />
                                  {schedule.instructor_name}
                                </div>
                                <div className="flex items-center mt-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-16 flex items-center justify-center text-gray-300">
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedules
              .filter(schedule => schedule.day_of_week === new Date().toLocaleDateString('en-US', { weekday: 'long' }))
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map(schedule => (
                <div key={schedule.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900">{schedule.subject_name}</h3>
                  <div className="mt-2 space-y-2 text-sm text-blue-700">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Room {schedule.room_number}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {schedule.instructor_name}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulesView;
