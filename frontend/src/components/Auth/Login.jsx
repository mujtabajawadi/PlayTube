import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "../index";
import objAuthService from "../../services/authService";
import { useDispatch } from "react-redux";
import { login as storeLogin } from "../../store/authSlice";

const Login = () => {
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      const loginUser = await objAuthService.login(data);
      if (loginUser) {
        const currentUser = await objAuthService.getCurrentUser();
        if (currentUser) dispatch(storeLogin(currentUser.data));
        navigate("/my-profile");
      }
    } catch (error) {
      throw error;
    } finally {
      reset();
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit(handleLogin)}>
        <Input
          label="Email: "
          type="text"
          placeholder="john@email.com"
          {...register("email", {
            required: { value: true, message: "*email is requied!" },
          })}
        />
        {errors.email && (
          <p className="text-red-700 text-[3.5vw] sm:text-[1.5vw]  md:text-[1vw]">
            {errors.email.message}
          </p>
        )}

        <Input
          label="Password: "
          type="password"
          {...register("password", {
            required: { value: true, message: "*password id required!" },
            minLength: {
              value: 6,
              message: "*password too short(less than 6 characters)",
            },
          })}
        />
        {errors.password && (
          <p className="text-red-700 text-[3.5vw] sm:text-[1.5vw]  md:text-[1vw]">
            {errors.password.message}
          </p>
        )}

        <Input
          type="submit"
          disabled={isSubmitting}
          value={isSubmitting ? "Signing in" : "Login"}
        />
      </form>
      <NavLink to="/signup">Create account</NavLink>
    </>
  );
};

export default Login;
