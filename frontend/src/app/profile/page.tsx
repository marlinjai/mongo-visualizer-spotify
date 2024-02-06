"use client";
import React, { useEffect, useState } from "react";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  interface ProfileData {
    display_name: string;
    // Add any other properties you expect to receive from the backend
  }

  useEffect(() => {
    // Fetch the profile data from the backend
    const fetchProfileData = async () => {
      try {
        const response = await fetch("http://localhost/spotify/profile", {
          method: "GET",
          credentials: "include", // This is crucial for including cookies
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchProfileData();
  }, []); // The empty array ensures this effect runs once after initial render

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profileData) {
    return <div>Loading...</div>;
  }

  // Add a type guard to check if profileData is not null
  if (profileData !== null) {
    const ProfileData = profileData as ProfileData;
    return (
      <div>
        <h1>Profile Information</h1>
        {/* Render your profile data here */}
        <p>{ProfileData.display_name}</p>
      </div>
    );
  }

  return null;
};

export default Profile;
