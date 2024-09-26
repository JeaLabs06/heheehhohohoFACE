import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FIRESTORE_DB } from '../../firebaseutil/firebase_main';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import './generalstyles.css';

const EventManagement = () => {
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    venue: "",
    organizations: [],
    yearLevel: "",
    department: "",
    course: "",
    major: "",
  });

  const [organizationsList, setOrganizationsList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch organizations
        const orgSnapshot = await getDocs(collection(FIRESTORE_DB, 'organizations'));
        const orgList = orgSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrganizationsList(orgList);

        // Fetch departments
        const deptSnapshot = await getDocs(collection(FIRESTORE_DB, 'departments'));
        const deptList = deptSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDepartments(deptList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleDepartmentChange = async (e) => {
    const department = e.target.value;
    setEventData({ ...eventData, department });

    // Fetch year levels based on selected department
    const yearSnapshot = await getDocs(collection(FIRESTORE_DB, `departments/${department}/yearLevels`));
    const yearList = yearSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setYearLevels(yearList);

    // Fetch courses based on selected department
    const courseSnapshot = await getDocs(collection(FIRESTORE_DB, `departments/${department}/courses`));
    const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCourses(courseList);

    // Reset course, major, and year level when department changes
    setEventData((prev) => ({ ...prev, course: '', major: '', yearLevel: '' }));
    setMajors([]); // Clear majors when department changes
  };

  const handleCourseChange = async (e) => {
    const course = e.target.value;
    setEventData({ ...eventData, course });

    // Fetch majors based on selected course
    const majorSnapshot = await getDocs(collection(FIRESTORE_DB, `departments/${eventData.department}/courses/${course}/majors`));
    const majorList = majorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMajors(majorList);

    // Reset major when course changes
    setEventData((prev) => ({ ...prev, major: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(FIRESTORE_DB, 'events'), eventData);
      alert('Event added successfully!');
      navigate('/superadmin');
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event. Please try again.');
    }
  };

  // Sort departments, organizations, courses, majors, and year levels
  const sortedOrganizations = organizationsList.sort((a, b) => a.name.localeCompare(b.name));
  const sortedDepartments = departments.sort((a, b) => a.name.localeCompare(b.name));
  const sortedCourses = courses.sort((a, b) => a.name.localeCompare(b.name));
  const sortedMajors = majors.sort((a, b) => a.name.localeCompare(b.name));
  const sortedYearLevels = yearLevels.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="event-management">
      <button className="back-button" onClick={() => navigate('/superadmin')}>
        &lt; Back
      </button>

      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Event Name"
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          required
        ></textarea>
        <input
          type="datetime-local"
          name="startDate"
          onChange={handleChange}
          required
        />
        <input
          type="datetime-local"
          name="endDate"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="venue"
          placeholder="Venue"
          onChange={handleChange}
          required
        />

        {/* Select Department */}
        <label>Select Department:</label>
        <select name="department" onChange={handleDepartmentChange} required>
          <option value="">Select Department</option>
          {sortedDepartments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        {/* Select Year Level */}
        <label>Select Year Level:</label>
        <select name="yearLevel" onChange={handleChange} required>
          <option value="">Select Year Level</option>
          {sortedYearLevels.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name}
            </option>
          ))}
        </select>

        {/* Select Course */}
        {courses.length > 0 && (
          <>
            <label>Select Course:</label>
            <select name="course" onChange={handleCourseChange} required>
              <option value="">Select Course</option>
              {sortedCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Select Major */}
        {majors.length > 0 && (
          <>
            <label>Select Major:</label>
            <select name="major" onChange={handleChange}>
              <option value="">Select Major</option>
              {sortedMajors.map((major) => (
                <option key={major.id} value={major.id}>
                  {major.name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Select Organizations */}
        <label>Select Organizations:</label>
        <select name="organizations" onChange={handleChange} multiple>
          {sortedOrganizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default EventManagement;
