import React from "react";

const User = (props) => {
  const { avatar, fullName, username, coverImage, watchHistory } =
    props.userData;

//   console.log(avatar);
  return (
    <>
      <div className="flex w-full gap-5">
        <img src={avatar} alt="Profile Image" className="w-15 h-15 rounded-full" />
        <div>
          <h2>{fullName}</h2>
          <span>@{username}</span>
        </div>
      </div>
    </>
  );
};

export default User;
