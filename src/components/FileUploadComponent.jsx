import React, { useRef, useState, useEffect } from "react";
import { useToasts } from "react-toast-notifications";
import Dashboard from "@uppy/dashboard";
import ProgressBar from "@uppy/progress-bar";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { uploadData } from "aws-amplify/storage";
import axios from "axios";
import Uppy from "@uppy/core";

import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "@uppy/progress-bar/dist/style.css";

const FileUploadComponent = React.forwardRef(
  (
    {
      onUploadComplete,
      isUploading,
      setIsUploading,
      attachments,
      setAttachments,
      uploadProgress,
      setUploadProgress,
      currentFileIndex,
      setCurrentFileIndex,
      createdTaskId,
      setCreatedTaskId,
    },
    ref
  ) => {
    const { addToast } = useToasts();
    const uppy = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
      if (uppy.current) {
        return;
      }

      uppy.current = new Uppy({
        restrictions: {
          maxFileSize: 250 * 1024 * 1024,
          allowedFileTypes: [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "video/mp4",
          ],
        },
        autoProceed: false,
      })
        .use(Dashboard, {
          target: "#uppy-dashboard",
          inline: true,
          height: 300,
          showProgressDetails: true,
          hideUploadButton: true,
          proudlyDisplayPoweredByUppy: false,
          doneButtonHandler: null,
        })
        .use(ProgressBar, {
          target: "#uppy-progress-bar",
          hideAfterFinish: false,
        });

      uppy.current.on("file-added", (file) => {
        const filePreview = {
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          data: file.data,
          meta: file.meta,
          uploaded: false,
        };
        setAttachments((prev) => [...prev, filePreview]);
        addToast(`${file.name} has been added`, {
          appearance: "info",
          autoDismiss: true,
        });
      });

      uppy.current.on("file-removed", (file) => {
        setAttachments((prev) => prev.filter((f) => f.id !== file.id));
      });

      return () => {
        if (uppy.current && typeof uppy.current.reset === "function") {
          uppy.current.reset();
          uppy.current = null;
        }
      };
    }, []);

    const uploadFileToS3 = async (file, taskID, onProgress) => {
      try {
        const uniqueKey = `tasks/${taskID}/${Date.now()}-${file.name}`;

        const result = await uploadData({
          path: uniqueKey,
          data: file.data,
          options: {
            bucket: {
              bucketName: "affooh-dev-uploads",
              region: "us-east-1",
            },
            onProgress: (progress) => {
              const percentage = Math.round(
                (progress.loaded / progress.total) * 100
              );
              onProgress?.(percentage);
            },
          },
        }).result;

        // Save attachment metadata to backend
        const attachmentData = {
          taskID: taskID,
          key: uniqueKey,
          name: file.name,
          size: file.size,
          format: file.type,
        };

        const response = await axios.post(
          `/tasks/${taskID}/attachments`,
          attachmentData
        );

        return {
          success: true,
          data: response.data,
          key: uniqueKey,
        };
      } catch (error) {
        console.error("S3 upload error:", error);

        // error handling
        let errorMessage = "File upload failed";
        if (error.name === "AccessDenied") {
          errorMessage =
            "Access denied to S3 bucket. Please check permissions.";
        } else if (error.name === "NetworkError") {
          errorMessage = "Network error during upload. Please try again.";
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    };

    const handleFileUploads = async (taskID) => {
      // Allow creating tasks without attachments
      if (attachments.length === 0) {
        addToast(
          `Task ID: ${taskID} created successfully without attachments!`,
          {
            appearance: "success",
            autoDismiss: true,
          }
        );
        return { success: true, uploaded: 0, failed: 0 };
      }

      setIsUploading(true);
      setUploadProgress(0);
      let successfulUploads = 0;
      let failedUploads = 0;

      for (let i = 0; i < attachments.length; i++) {
        if (isPaused) {
          addToast("Upload has been paused", {
            appearance: "info",
            autoDismiss: true,
          });
          return {
            success: false,
            uploaded: successfulUploads,
            failed: failedUploads,
          };
        }

        const file = attachments[i];
        setCurrentFileIndex(i + 1);

        // Update file state to show it's uploading
        uppy.current?.setFileState(file.id, {
          progress: {
            uploadStarted: Date.now(),
            uploadComplete: false,
            percentage: 0,
          },
        });

        // Progress callback for individual file
        const onFileProgress = (percentage) => {
          const overallProgress =
            (i / attachments.length) * 100 + percentage / attachments.length;
          setUploadProgress(Math.round(overallProgress));

          uppy.current?.setFileState(file.id, {
            progress: {
              uploadStarted: Date.now(),
              uploadComplete: false,
              percentage: percentage,
            },
          });
        };

        const result = await uploadFileToS3(file, taskID, onFileProgress);

        if (result.success) {
          successfulUploads++;
          uppy.current?.setFileState(file.id, {
            progress: {
              uploadStarted: Date.now(),
              uploadComplete: true,
              percentage: 100,
            },
          });
          setAttachments((prev) =>
            prev.map((att) =>
              att.id === file.id
                ? { ...att, uploaded: true, s3Key: result.key }
                : att
            )
          );
          addToast(`${file.name} has been uploaded successfully`, {
            appearance: "success",
            autoDismiss: true,
          });
        } else {
          failedUploads++;
          uppy.current?.setFileState(file.id, {
            error: result.error || "Upload failed",
          });
          addToast(`${file.name} upload failed: ${result.error}`, {
            appearance: "error",
            autoDismiss: true,
          });
        }

        // Small delay between files
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setUploadProgress(100);
      setIsUploading(false);

      if (failedUploads > 0) {
        return {
          success: false,
          uploaded: successfulUploads,
          failed: failedUploads,
        };
      }
      addToast(
        `Task ID: ${taskID} created successfully! ${successfulUploads} files have been uploaded`,
        {
          appearance: "success",
          autoDismiss: true,
        }
      );

      return {
        success: true,
        uploaded: successfulUploads,
        failed: failedUploads,
      };
    };

    React.useImperativeHandle(ref, () => ({
      handleFileUploads,
    }));

    const handleFileOpen = async (file) => {
      if (file.data) {
        const url = URL.createObjectURL(file.data);
        window.open(url, "_blank");
      }
    };

    const removeFile = (fileId) => {
      if (isUploading) return;

      setAttachments((prev) => prev.filter((f) => f.id !== fileId));
      uppy.current?.removeFile(fileId);
      addToast("File has been removed", {
        appearance: "info",
        autoDismiss: true,
      });
    };

    const handleCancelUpload = () => {
      setIsPaused(true);
      uppy.current?.cancelAll();
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentFileIndex(0);
      addToast("Upload has been cancelled", {
        appearance: "warning",
        autoDismiss: true,
      });
    };

    const handleResumeUpload = async () => {
      if (createdTaskId) {
        setIsPaused(false);
        setIsUploading(true);
        await onUploadComplete(createdTaskId);
      }
    };

    const renderFilePreviews = () => {
      if (attachments.length === 0) return null;

      return (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Files to Upload:</p>
          {attachments.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const isCurrentlyUploading =
              isUploading && index === currentFileIndex - 1;
            const isUploaded = file.uploaded;
            const isPending = isUploading && index > currentFileIndex - 1;

            return (
              <div
                key={file.id}
                className={`flex items-center space-x-2 my-2 p-2 rounded transition-colors ${
                  isUploaded
                    ? "bg-green-50 border border-green-200"
                    : isCurrentlyUploading
                      ? "bg-blue-50 border border-blue-200"
                      : isPending
                        ? "bg-gray-50 border border-gray-200"
                        : "bg-gray-50"
                }`}
              >
                {isImage ? (
                  <img
                    src={URL.createObjectURL(file.data)}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded cursor-pointer"
                    onClick={() => handleFileOpen(file)}
                  />
                ) : (
                  <div
                    className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded cursor-pointer"
                    onClick={() => handleFileOpen(file)}
                  >
                    <span className="text-xs text-gray-500">
                      {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {isCurrentlyUploading && (
                    <p className="text-xs text-blue-600 font-medium">
                      Uploading...
                    </p>
                  )}
                  {isUploaded && (
                    <p className="text-xs text-green-600 font-medium">
                      ✓ Uploaded
                    </p>
                  )}
                  {isPending && (
                    <p className="text-xs text-gray-500">Waiting...</p>
                  )}
                </div>
                {!isUploading && (
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 p-1"
                    onClick={() => removeFile(file.id)}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}

          {isUploading && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-700">
                  {createdTaskId
                    ? `Task ${createdTaskId} created! Uploading files..... (${currentFileIndex}/${attachments.length})`
                    : "Creating task..."}
                </span>
                <span className="text-sm text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {(isUploading || isPaused) && (
            <div className="flex space-x-4 mt-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancelUpload}
                disabled={!isUploading}
              >
                Cancel Upload
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleResumeUpload}
                disabled={!isPaused}
              >
                Resume Upload
              </button>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div id="uppy-dashboard" className="mb-4"></div>
        <div id="uppy-progress-bar"></div>
        {renderFilePreviews()}
      </div>
    );
  }
);

export default FileUploadComponent;
