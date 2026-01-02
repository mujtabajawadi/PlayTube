import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../UI/Input";
import objAuthService from "../../services/authService";
import { NavLink, useNavigate } from "react-router-dom";
import { login as storeLogin } from "../../store/authSlice";
import { useDispatch } from "react-redux";

const Signup = () => {
  const [step, setStep] = useState(1);

  const {
    reset,
    register,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fieldsPerStep = {
    1: ["username", "fullName"],
    2: ["email"],
    3: ["password"],
    4: ["avatar", "coverImage"],
  };
  const totalSteps = Object.keys(fieldsPerStep).length;


  const nextStep = async () => {
    const fields = fieldsPerStep[step];
    const isValid = await trigger(fields);

    if (isValid) {
      setStep((previousStep) => previousStep + 1);
    }
  };

  const backStep = () => setStep((previousStep) => previousStep - 1);

  const formSubmit = async (data) => {
    try {
      const registerUser = await objAuthService.createAccount(data);

      if (registerUser) {
        const currentUser = await objAuthService.getCurrentUser();
        if (currentUser) dispatch(storeLogin(currentUser.data));
        navigate("/my-profile");
      }
    } catch (error) {
      throw error;
    } finally {
      reset();
      setStep(1);
    }
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <div>
        <h3>
          Step {step} of {totalSteps}
        </h3>
      </div>

      {step === 1 && (
        <>
          <Input
            label="Full Name: "
            type="text"
            placeholder="@John Doe..."
            {...register("fullName", {
              required: { value: true, message: "*Full Name is required!" },
              minLength: {
                value: 3,
                message: "Name is too short(less than 3 characters.)",
              },
              maxLength: {
                value: 30,
                message: "Name is too long(more than 30 characters)",
              },
            })}
          />
          {errors.fullName && (
            <p className="text-red-700 text-[3vw] sm:text-[1.5vw] md:text-[1vw]">
              {errors.fullName.message}
            </p>
          )}

          <Input
            label="Username: "
            type="text"
            placeholder="@johndoe123..."
            {...register("username", {
              required: { value: true, message: "*username is required!" },
              minLength: {
                value: 3,
                message: "Name is too short(less than 3 characters.)",
              },
              maxLength: {
                value: 30,
                message: "Name is too long(more than 30 characters)",
              },
            })}
          />
          {errors.username && (
            <p className="text-red-700 text-[3.5vw] sm:text-[1.5vw]  md:text-[1vw]">
              {errors.username.message}
            </p>
          )}

          <NavLink to="/login">
            <button>Login</button>
          </NavLink>

          <button type="button" onClick={nextStep}>
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <Input
            label="Email: "
            type="email"
            placeholder="johndoe123@email.com..."
            {...register("email", {
              required: { value: true, message: "*email is required!" },
            })}
          />
          {errors.email && (
            <p className="text-red-700 text-[3.5vw] sm:text-[1.5vw]  md:text-[1vw]">
              {errors.email.message}
            </p>
          )}
          <button type="button" onClick={backStep}>
            Previous
          </button>
          <button type="button" onClick={nextStep}>
            Next
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <Input
            label="Password: "
            type="password"
            {...register("password", {
              required: { value: true, message: "*password is required!" },
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
          <button type="button" onClick={backStep}>
            Previous
          </button>
          <button type="button" onClick={nextStep}>
            Next
          </button>
        </>
      )}

      {step === 4 && (
        <>
          <Input
            label="Choose Profile Image : "
            type="file"
            {...register("avatar", {
              required: { value: true, message: "*Profile Image is required!" },
            })}
          />
          {errors.avatar && (
            <p className="text-red-700 text-[3.5vw] sm:text-[1.5vw]  md:text-[1vw]">
              {errors.avatar.message}
            </p>
          )}
          <Input
            label="Choose Cover Image :(optional) "
            type="file"
            {...register("coverImage")}
          />
          <button type="button" onClick={backStep}>
            Previous
          </button>
          <input
            type="submit"
            disabled={isSubmitting}
            value={isSubmitting ? "Signing in" : "Signup"}
          />
        </>
      )}
    </form>
  );
};

export default Signup;
