import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

const ensureCloudinaryEnv = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env'
    );
  }

  if (!isConfigured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    isConfigured = true;
  }
};

export const uploadBufferToCloudinary = async ({ buffer, fileName, folder, resourceType }) => {
  ensureCloudinaryEnv();

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType || 'auto',
        use_filename: true,
        unique_filename: true,
        filename_override: fileName,
      },
      (error, uploadResult) => {
        if (error) {
          reject(error);
        } else {
          resolve(uploadResult);
        }
      }
    );

    uploadStream.end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
    format: result.format,
  };
};

export const getSignedRawFileUrl = ({ publicId, expiresAt }) => {
  ensureCloudinaryEnv();

  const effectiveExpiry = expiresAt || Math.floor(Date.now() / 1000) + 10 * 60;

  const normalizedCandidates = [publicId];
  if (String(publicId).toLowerCase().endsWith('.pdf')) {
    normalizedCandidates.push(String(publicId).replace(/\.pdf$/i, ''));
  }

  const urls = [];
  for (const id of normalizedCandidates) {
    urls.push(
      cloudinary.url(id, {
        resource_type: 'raw',
        type: 'authenticated',
        secure: true,
        sign_url: true,
        expires_at: effectiveExpiry,
      })
    );

    urls.push(
      cloudinary.url(id, {
        resource_type: 'raw',
        type: 'upload',
        secure: true,
        sign_url: true,
        expires_at: effectiveExpiry,
      })
    );

    // private_download_url can work for restricted raw assets in some Cloudinary setups.
    urls.push(
      cloudinary.utils.private_download_url(id, 'pdf', {
        resource_type: 'raw',
        type: 'upload',
        expires_at: effectiveExpiry,
        attachment: false,
      })
    );
  }

  return [...new Set(urls.filter(Boolean))];
};
