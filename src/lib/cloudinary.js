export async function uploadImage(file) {
  if (!file) {
    return '';
  }

  if (typeof file === 'string') {
    if (file.startsWith('http://') || file.startsWith('https://')) {
      return file;
    }
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const getBase64Fallback = () => new Promise((resolve) => {
    if (typeof file === 'string') {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  if (!cloudName || !uploadPreset) {
    return getBase64Fallback();
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message;
      console.warn('Cloudinary upload warning:', errMsg);
      return getBase64Fallback();
    }

    const data = await response.json();
    return data.secure_url;
  } catch (err) {
    console.warn('Network error uploading to Cloudinary, fallback to data URL:', err);
    return getBase64Fallback();
  }
}
