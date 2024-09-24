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
    year: [],
    selectedDepartments: {},
  });

  const [organizationsList, setOrganizationsList] = useState([]);
  const [yearLevels, setYearLevels] = useState(["1st Year", "2nd Year", "3rd Year", "4th Year"]);
  const [departments, setDepartments] = useState({});

  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgQuerySnapshot = await getDocs(collection(FIRESTORE_DB, "organizations"));
        const orgs = orgQuerySnapshot.docs.map(doc => doc.data().name);
        setOrganizationsList(orgs);

        const deptQuerySnapshot = await getDocs(collection(FIRESTORE_DB, "departments"));
        const departmentsData = {};

        for (const doc of deptQuerySnapshot.docs) {
          const deptName = doc.data().name;
          const coursesQuerySnapshot = await getDocs(collection(doc.ref, "courses"));
          const coursesData = {};

          for (const courseDoc of coursesQuerySnapshot.docs) {
            const courseName = courseDoc.data().name;
            const majorsQuerySnapshot = await getDocs(collection(courseDoc.ref, "majors"));
            const majors = majorsQuerySnapshot.docs.map(majorDoc => majorDoc.data().name);
            coursesData[courseName] = majors;
          }
          departmentsData[deptName] = coursesData;
        }

        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({
      ...eventData,
      [name]: value,
    });
  };

  const handleOrganizationChange = (e) => {
    const { value, checked } = e.target;
    const { organizations } = eventData;

    if (value === "selectAll") {
      setEventData({
        ...eventData,
        organizations: checked ? organizationsList : [],
      });
    } else {
      if (checked) {
        setEventData({
          ...eventData,
          organizations: [...organizations, value],
        });
      } else {
        setEventData({
          ...eventData,
          organizations: organizations.filter((organization) => organization !== value),
        });
      }
    }
  };

  const handleYearChange = (e) => {
    const { value, checked } = e.target;
    const { year } = eventData;

    if (value === "selectAllYears") {
      setEventData({
        ...eventData,
        year: checked ? yearLevels : [],
      });
    } else {
      if (checked) {
        setEventData({
          ...eventData,
          year: [...year, value],
        });
      } else {
        setEventData({
          ...eventData,
          year: year.filter((yr) => yr !== value),
        });
      }
    }
  };

  const handleDepartmentChange = (e) => {
    const { value, checked } = e.target;
    const [department] = value.split("|");
    const { selectedDepartments } = eventData;

    if (checked) {
      setEventData({
        ...eventData,
        selectedDepartments: {
          ...selectedDepartments,
          [department]: {
            ...(selectedDepartments[department] || {}),
          },
        },
      });
    } else {
      const { [department]: removedDepartment, ...restDepartments } = selectedDepartments;
      setEventData({
        ...eventData,
        selectedDepartments: restDepartments,
      });
    }
  };

  const handleCourseChange = (e) => {
    const { value, checked } = e.target;
    const [department, course] = value.split("|");
    const { selectedDepartments } = eventData;

    if (checked) {
      setEventData({
        ...eventData,
        selectedDepartments: {
          ...selectedDepartments,
          [department]: {
            ...(selectedDepartments[department] || {}),
            [course]: selectedDepartments[department]?.[course] || [],
          },
        },
      });
    } else {
      setEventData({
        ...eventData,
        selectedDepartments: {
          ...selectedDepartments,
          [department]: {
            ...selectedDepartments[department],
            [course]: [],
          },
        },
      });
    }
  };

  const handleMajorChange = (e) => {
    const { value, checked } = e.target;
    const [department, course, major] = value.split("|");
    const { selectedDepartments } = eventData;

    if (checked) {
      setEventData({
        ...eventData,
        selectedDepartments: {
          ...selectedDepartments,
          [department]: {
            ...selectedDepartments[department],
            [course]: [
              ...(selectedDepartments[department]?.[course] || []),
              major,
            ],
          },
        },
      });
    } else {
      setEventData({
        ...eventData,
        selectedDepartments: {
          ...selectedDepartments,
          [department]: {
            ...selectedDepartments[department],
            [course]: (selectedDepartments[department]?.[course] || []).filter(m => m !== major),
          },
        },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(FIRESTORE_DB, "events"), eventData);
      alert('Event added successfully!');
      navigate('/superadmin');
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event. Please try again.');
    }
  };

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

        <div className="checkbox-group">
          <label>Select Year Levels:</label>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="selectAllYears"
              value="selectAllYears"
              onChange={handleYearChange}
              checked={eventData.year.length === yearLevels.length}
            />
            <label htmlFor="selectAllYears">Select All</label>
          </div>
          {yearLevels.map((year, index) => (
            <div className="checkbox-item" key={index}>
              <input
                type="checkbox"
                id={`year-${index}`}
                value={year}
                onChange={handleYearChange}
                checked={eventData.year.includes(year)}
              />
              <label htmlFor={`year-${index}`}>{year}</label>
            </div>
          ))}
        </div>

        <div className="checkbox-group">
          <label>Select Organizations:</label>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="selectAllOrgs"
              value="selectAll"
              onChange={handleOrganizationChange}
              checked={eventData.organizations.length === organizationsList.length}
            />
            <label htmlFor="selectAllOrgs">Select All</label>
          </div>
          {organizationsList.map((organization, index) => (
            <div className="checkbox-item" key={index}>
              <input
                type="checkbox"
                id={`organization-${index}`}
                value={organization}
                onChange={handleOrganizationChange}
                checked={eventData.organizations.includes(organization)}
              />
              <label htmlFor={`organization-${index}`}>{organization}</label>
            </div>
          ))}
        </div>

        <div className="checkbox-group">
          <label>Select Departments:</label>
          {Object.keys(departments).map((department, deptIndex) => (
            <div key={deptIndex}>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id={`department-${deptIndex}`}
                  value={department}
                  onChange={handleDepartmentChange}
                  checked={eventData.selectedDepartments[department] !== undefined}
                />
                <label htmlFor={`department-${deptIndex}`}>{department}</label>
              </div>

              {/* Show courses dropdown if department is selected */}
              {eventData.selectedDepartments[department] && (
                <div className="courses-dropdown">
                  {Object.keys(departments[department]).map((course, courseIndex) => (
                    <div key={courseIndex}>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`course-${deptIndex}-${courseIndex}`}
                          value={`${department}|${course}`}
                          onChange={handleCourseChange}
                        />
                        <label htmlFor={`course-${deptIndex}-${courseIndex}`}>{course}</label>
                      </div>

                      {/* Show majors checkboxes if course is selected */}
                      {eventData.selectedDepartments[department][course] && (
                        <div className="majors-checkbox-group">
                          {departments[department][course].map((major, majorIndex) => (
                            <div className="checkbox-item" key={majorIndex}>
                              <input
                                type="checkbox"
                                id={`major-${deptIndex}-${courseIndex}-${majorIndex}`}
                                value={`${department}|${course}|${major}`}
                                onChange={handleMajorChange}
                              />
                              <label htmlFor={`major-${deptIndex}-${courseIndex}-${majorIndex}`}>{major}</label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default EventManagement;
