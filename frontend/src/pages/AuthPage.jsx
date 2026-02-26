import React from "react";
import Login from "../components/Login";
import Register from "../components/Register";

const AuthPage = ({ type }) => {
  return type === "login" ? <Login /> : <Register />;
};

export default AuthPage;
