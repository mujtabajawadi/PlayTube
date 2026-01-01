import { useForm } from "react-hook-form";
import { Input } from "../index";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const PublishVideo = () => {
  const [step, setStep] = useState(1);

  const {
    watch,
    reset,
    trigger,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

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

  const videoFile = watch("videoFile");
  const videoPreview = videoFile?.[0]
    ? URL.createObjectURL(videoFile[0])
    : null;

  const thumbnailFile = watch("thumbnail");
  const thumbnailPreview = thumbnailFile?.[0]
    ? URL.createObjectURL(thumbnailFile[0])
    : null;

  const uploadVideo = (data) => {};

  return (
    <form onSubmit={handleSubmit(uploadVideo)}>
      <div>
        <h3>
          Step {step} of {totalSteps}
        </h3>
      </div>

      {step === 1 && (
        <>
          <Input
            label="Select Video: "
            accept="video/*"
            type="file"
            {...register("videoFile", {
              required: { value: true, message: "*Video file is required!" },
            })}
          />
          {errors.videoFile && (
            <p className="text-red-700 text-[3.5vw] sm:text-[1.5vw]  md:text-[1vw]">
              {errors.videoFile.message}
            </p>
          )}

          {videoPreview && <video src={videoPreview} controls autoPlay></video>}

          <NavLink to="/">
            <button>Cancel</button>
          </NavLink>
          <button type="button" onClick={nextStep}>
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <Input
            label="Select Thumbnail: "
            accept="image/*"
            type="file"
            {...register("thumbnail", {
              required: { value: true, message: "*Thumbnail is required!" },
            })}
          />
          {errors.thumbnail && (
            <p className="text-red-700 text-[3.5vw] sm:text-[1.5vw]  md:text-[1vw]">
              {errors.thumbnail.message}
            </p>
          )}

          {thumbnailPreview && (
            <div className="w-75 h-75">
              <img src={thumbnailPreview}></img>
            </div>
          )}

          <button type="button" onClick={backStep}>
            Back
          </button>

          <button type="button" onClick={nextStep}>
            Next
          </button>
        </>
      )}
    </form>
  );
};

export default PublishVideo;
