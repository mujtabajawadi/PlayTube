import { useForm } from "react-hook-form";
import { Input } from "../index";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import objVideoService from "../../services/videoService";

const PublishVideo = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const {
    watch,
    reset,
    trigger,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const fieldsPerStep = {
    1: ["videoFile"],
    2: ["thumbnail", "title"],
    3: ["description"],
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

  const uploadVideo = async (data) => {
    try {
      const uploadedVideo = await objVideoService.publishVideo(data);

      if (uploadedVideo) {
        navigate("/");
      }
    } catch (error) {
      throw error;
    } finally {
      reset();
      setStep(1);
    }
    console.log(data);
  };

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

          <div>
            <Input
              label="Title: "
              type="text"
              placeholder="Create a title"
              {...register("title", {
                required: { value: true, message: "*Title is required!" },
              })}
            />
            {errors.title && (
              <p className="text-red-700 text-[3.5vw] sm:text-[1.5vw]  md:text-[1vw]">
                {errors.title.message}
              </p>
            )}

            <p>Set visibility: </p>
            <div>
              <Input
                label="Private"
                type="radio"
                value="false"
                {...register("isPublished")}
              />
              <Input
                label="Public"
                type="radio"
                value="true"
                defaultChecked
                {...register("isPublished")}
              />
            </div>
          </div>

          <button type="button" onClick={backStep}>
            Back
          </button>

          <button type="button" onClick={nextStep}>
            Next
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <div>
            <label htmlFor="description">Description</label>
          </div>
          <textarea
            id="description"
            rows="10"
            cols="50"
            className="border"
            {...register("description", {
              required: { value: true, message: "*Description is required!" },
            })}
          />
          {errors.description && (
            <p className="text-red-700 text-[3.5vw] sm:text-[1.5vw]  md:text-[1vw]">
              {errors.description.message}
            </p>
          )}
          <div>
            <button type="button" onClick={backStep}>
              Back
            </button>

            <Input
              type="submit"
              disabled={isSubmitting}
              value={isSubmitting ? "Uploading..." : "Upload"}
            />
          </div>
        </>
      )}
    </form>
  );
};

export default PublishVideo;
