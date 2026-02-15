export async function getUploadUrl(image: File | null) {
  try {
    const file = image;
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "product_images");
    data.append("cloud_name", "dwuelxoyn");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dwuelxoyn/image/upload",
      {
        method: "POST",
        body: data,
      },
    );
    const response = await res.json();
    const { url } = response;
    return url;
  } catch (error) {
    console.log("Error in get upload url");
    console.log(error);
  }
}
