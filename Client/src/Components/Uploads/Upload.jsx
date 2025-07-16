import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { FidgetSpinner } from "react-loader-spinner";
import "./Upload.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const acceptMedia = location.state?.acceptMedia;

  const onDrop = useCallback((acceptedFiles) => {
    const selected = acceptedFiles[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }, []);

  const acceptedTypes = {
    image: { "image/*": [".jpg", ".jpeg", ".png"] },
    video: { "video/*": [".mp4", ".avi", ".mov"] },
    audio: { "audio/*": [".mp3", ".wav"] },
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes[acceptMedia] || {},
    multiple: false,
  });

  const getPreview = () => {
    if (!file) return null;
    const type = file.type;

    if (type.startsWith("image/")) {
      return <img src={preview} alt="Preview" className="preview-image" />;
    } else if (type.startsWith("video/")) {
      return <video src={preview} controls className="preview-media" />;
    } else if (type.startsWith("audio/")) {
      return <audio src={preview} controls className="preview-audio" />;
    } else {
      return <p>Unsupported file type</p>;
    }
  };

  const handleMusicUpload = async () => {
    if (!file) return alert("Please select a file.");
    if (!name || !caption) return alert("Please enter name and caption.");

    setIsLoading(true);

    const formData = new FormData();
    formData.append("media", file);
    formData.append("name", name);
    formData.append("singer", caption);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/media/upload-music",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Upload successful!");
      setTimeout(() => {
        navigate("/");
      }, 600);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(res.error);
    } finally {
      setIsLoading(false);
      setFile(null);
      setPreview("");
      setName("");
      setCaption("");
    }
  };

  const handleMediaUpload = async () => {
    if (!file) return alert("Please select a file.");
    if (!name || !caption) return alert("Please enter name and caption.");

    setIsLoading(true);

    const formData = new FormData();
    formData.append("media", file);
    formData.append("name", name);
    formData.append("caption", caption);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/media/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Upload successful!");
      setTimeout(() => {
        navigate("/");
      }, 600);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
      setFile(null);
      setPreview("");
      setName("");
      setCaption("");
    }
  };
  return (
    <div className="upload-wrapper">
      <div className="upload-container">
        {isLoading && (
          <div className="fidget-spinner-wrapper">
            <FidgetSpinner height={80} width={80} />
          </div>
        )}

        <div className="upload-header">
          <h1>Upload {acceptMedia?.toUpperCase()}</h1>
          <input
            type="text"
            placeholder={`Enter ${acceptMedia} name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="text"
            placeholder={
              acceptMedia === "audio"
                ? "Enter audio album name"
                : `Enter ${acceptMedia} caption`
            }
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} disabled={isLoading} />
          {isDragActive ? (
            <p>Drop the file here...</p>
          ) : (
            <p>Drag & drop or click to select your {acceptMedia}</p>
          )}
        </div>

        <div className="preview-box">{getPreview()}</div>

        {acceptMedia === "audio" ? (
          <button
            disabled={!file || isLoading}
            className="upload-btn"
            onClick={handleMusicUpload}
          >
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        ) : (
          <button
            disabled={!file || isLoading}
            className="upload-btn"
            onClick={handleMediaUpload}
          >
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Upload;
