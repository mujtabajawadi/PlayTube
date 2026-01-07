import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import objAuthService from "../services/authService";
import { logout as storeLogout } from "../store/authSlice";
import { User } from "../components/index";

const Profile = () => {
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);

  const handleSignOut = async () => {
    await objAuthService.logout().then(() => {
      dispatch(storeLogout());
    });
  };

  if (!authStatus) {
    return (
      <>
        <h1>You are currently logged out.</h1>
        <NavLink to="/login">Sign in</NavLink>
      </>
    );
  }

  return (
    <>
      <div className="p-3 flex flex-col gap-3 items-start">
        <User userData={userData.data} />
        <button className="cursor-pointer" onClick={handleSignOut}>
          Sign out
        </button>
      </div>

      <footer className="w-full h-10 fixed bottom-0 z-999 bg-[rgba(0,0,0,0.4)] backdrop-blur-xl flex gap-5 justify-between text-white p-3">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/publish-video">Publish Video</NavLink>
        <NavLink to="/my-profile">My Profile</NavLink>
      </footer>
    </>
  );
};

export default Profile;
