import React, { useEffect, useState } from "react";
import "./Profile.css";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const validationSchema = Yup.object({
  name: Yup.string().required("Required"),
  bio: Yup.string().max(160).required("Required"),
});

const EditProfile = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { _id, name, bio, profile } = location.state || {};

  useEffect(() => {
    if (name && bio && profile) {
      formik.setValues({ name, bio });
      setImagePreview(profile);
    }
  }, [name, bio, profile]);

  const handleImageChanges = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImage(file);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      bio: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      if (image) formData.append("profile", image);
      formData.append("name", values.name);
      formData.append("bio", values.bio);

      try {
        const res = await axios.put(
          `http://localhost:3000/api/user/update/${_id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        toast.success("Profile updated");
        navigate("/user-profile");
      } catch (err) {
        toast.error(err.response?.data?.message || "Update failed");
      }
    },
  });

  return (
    <div className="edit-profile-screen">
      <div className="edit-profile-container">
        <form className="edit-profile-form" onSubmit={formik.handleSubmit}>
          <h2>Edit Profile</h2>

          <div className="profile-image-section">
            <label htmlFor="profile-upload" className="profile-image-wrapper">
              <img
                src={
                  imagePreview ||
                  "https://icon-library.com/images/profile-icon-png/profile-icon-png-1.jpg"
                }
                alt="Profile"
                className="profile-images"
              />
              <div className="overlay">
                <span className="edit-text">Edit</span>
              </div>
            </label>
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              onChange={handleImageChanges}
              style={{ display: "none" }}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="error-text">{formik.errors.name}</div>
            )}
          </div>

          <div className="input-group">
            <input
              type="text"
              name="bio"
              placeholder="Bio"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.bio}
            />
            {formik.touched.bio && formik.errors.bio && (
              <div className="error-text">{formik.errors.bio}</div>
            )}
          </div>

          <button type="submit" className="edit-button">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
