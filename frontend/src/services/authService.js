import axiosInstance from "../api/config.js";
export class AuthService {
  async createAccount({
    fullName,
    username,
    email,
    password,
    avatar,
    coverImage,
  }) {
    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      if (avatar && avatar[0]) {
        formData.append("avatar", avatar[0]);
      }
      if (coverImage && coverImage[0]) {
        formData.append("coverImage", coverImage[0]);
      }
      const userAccount = await axiosInstance.post("/users/register", formData);
      if (userAccount) {
        return this.login({ email, password });
      } else {
        return userAccount;
      }
    } catch (error) {
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      const response = await axiosInstance.post("/users/login", {
        email,
        password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    try{
      const response = await axiosInstance.get("/users/current-user");
      return response;
    } catch(error){
      return error.message
    }
  }

  async logout() {
    try {
      await axiosInstance.post("/users/logout");
      return true;
    } catch (error) {
      throw error;
    }
  }
}

const objAuthService = new AuthService();
export default objAuthService;
