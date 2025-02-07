export const uploadAvatar = async (file: File): Promise<string | null> => {
    const cloudName = "dbvyexitw"; // Thay bằng Cloud Name của bạn
    //const uploadPreset = "your_upload_preset"; // Thay bằng Upload Preset
  
    const formData = new FormData();
    formData.append("file", file);
    //formData.append("upload_preset", uploadPreset);
  
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      console.log(response);
      if (!response.ok) throw new Error("Upload failed");


      const data = await response.json();
      return data.secure_url; // URL của ảnh đã upload
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };
  