import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./Signup.css";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

const handlelogin = async (values) => {
  console.log("Login values:", values);
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/login",
      values
    );
    if (response.status === 200) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("isLogedin", true);
      toast.success("Login successful!");
      window.location.href = "/";
    } else {
      toast.error("Login failed. Please try again.");
    }
  } catch (error) {
    console.error("Login error:", error);
    toast.error("Login failed. Please check your credentials.");
  }
};

const LoginScreen = () => {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      await handlelogin(values);
    },
  });

  return (
    <div className="login-screen">
      <div className="login-container">
        <form className="login-form" onSubmit={formik.handleSubmit}>
          <h2>Welcome Back</h2>

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="error-text">{formik.errors.email}</div>
            )}
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="error-text">{formik.errors.password}</div>
            )}
          </div>

          <button type="submit">Login</button>

          <div className="footer">
            Don't have an account?{" "}
            <span onClick={() => navigate("/signup", { replace: true })}>
              Sign Up
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
