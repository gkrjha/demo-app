import React, { useState } from "react";
import "./Signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const validationSchema = Yup.object({
  username: Yup.string().min(3).required("Required"),
  email: Yup.string().email().required("Required"),
  password: Yup.string()
    .min(5)
    .matches(/[A-Z]/, "Must contain 1 uppercase letter")
    .matches(/[0-9]/, "Must contain 1 number")
    .matches(/[!@#$%^&*]/, "Must contain 1 special character")
    .required("Required"),
  name: Yup.string().required("Required"),
  bio: Yup.string().max(160).required("Required"),
  gender: Yup.string().oneOf(["male", "female", "other"]).required("Required"),
});

const SignupScreen = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const navigate = useNavigate();

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
      username: "",
      email: "",
      password: "",
      name: "",
      bio: "",
      gender: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      if (image) {
        formData.append("profile", image);
      }
      for (let key in values) {
        formData.append(key, values[key]);
      }

      try {
        const res = await axios.post(
          "http://localhost:3000/api/user/signup",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success(res.data.message || "Signup successful");
        navigate("/login", { replace: true });
      } catch (err) {
        toast.error(err.response?.data?.message || "Signup failed");
      }
    },
  });

  return (
    <div className="signup-screen">
      <div className="signup-container">
        <form className="signup-form" onSubmit={formik.handleSubmit}>
          <h2>Create Account</h2>

          {/* Profile Image Upload */}
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

          {/* Input Fields */}
          {["username", "email", "password", "name", "bio"].map((field) => (
            <div className="input-group" key={field}>
              <input
                type={field === "password" ? "password" : "text"}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values[field]}
              />
              {formik.touched[field] && formik.errors[field] && (
                <div className="error-text">{formik.errors[field]}</div>
              )}
            </div>
          ))}

          {/* Gender Dropdown */}
          <div className="input-group">
            <select
              name="gender"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.gender}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              {/* <option value="other">Other</option> */}
            </select>
            {formik.touched.gender && formik.errors.gender && (
              <div className="error-text">{formik.errors.gender}</div>
            )}
          </div>

          <button type="submit">Sign Up</button>

          <p className="login-link">
            I have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupScreen;
