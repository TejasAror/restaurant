import cloudinary from "./cloudinary.js";



const uploadImageOnCloudinary = async (file: Express.Multer.File): Promise<string> => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    const base64Image = file.buffer.toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64Image}`;

    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "restaurant_images", // optional: organize in Cloudinary
    });

    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Image upload failed");
  }
};

export default uploadImageOnCloudinary;
