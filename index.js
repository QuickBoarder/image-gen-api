import { v2 as cloudinary } from 'cloudinary';
import fetch from 'node-fetch'; // Assuming you have the node-fetch package installed

cloudinary.config({
    cloud_name: 'dcwsgwsfw',
    api_key: '596255516127773',
    api_secret: 'pThBvxX6russhHj_jKySLVpFzoQ'
});

async function query(textPrompt) {
    const data = { "inputs": textPrompt };

    const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
        {
            headers: { Authorization: "Bearer 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" },
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    if (response.ok) {
        const blob = await response.blob();
        const fileData = await blob.arrayBuffer(); // Get the ArrayBuffer of the Blob

        // Convert ArrayBuffer to base64 string
        const base64Data = Buffer.from(fileData).toString('base64');

        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(`data:image/png;base64,${base64Data}`, {
            public_id: "generated_image", // Public ID for the uploaded image
            folder: "generated_images" // Optional folder in Cloudinary
        });

        const imageUrl = uploadResult.secure_url; // URL of the uploaded image on Cloudinary

        return imageUrl;
    } else {
        throw new Error('Failed to fetch image.');
    }
}

// Usage example
const textPrompt = "Astronaut riding a horse";
query(textPrompt).then((imageUrl) => {
    console.log('Uploaded image URL:', imageUrl);
}).catch((error) => {
    console.error('Error:', error);
});
