import { Outlet } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import objAuthService from "./services/authService";
import { login as storeLogin, logout as storeLogout } from "./store/authSlice";

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch();

  useEffect(() => {
    objAuthService.getCurrentUser().then((response) => {
      if (response && response.data) {
        const userData = response.data
        dispatch(storeLogin(userData))
      } else {
        dispatch(storeLogout())
      }
    }).catch(() => {
      dispatch(storeLogout())
    }).finally(() => {
      setLoading(false)
    })
  }, [dispatch]);

 
  return !loading ? (
    <>
      <Outlet />
    </>
  ) : (
    <div>Checking session...</div>
  );
}

export default App;
