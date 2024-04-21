import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

const app = express();

app.use(cors());
app.use(bodyParser.json());

cloudinary.config({
    cloud_name: 'dcwsgwsfw',
    api_key: '596255516127773',
    api_secret: 'pThBvxX6russhHj_jKySLVpFzoQ'
});

function generatePrompts(objectName) {
    const prompts = [
        `${objectName} from front viewing angle`,
        `${objectName} from back viewing angle`,
        `${objectName} from right viewing angle`,
        `${objectName} from left viewing angle`
    ];

    return prompts;
}

async function generateImage(textPrompt) {
    const data = { "inputs": textPrompt };

    const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
        {
            headers: { Authorization: "Bearer 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" },
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch image.');
    }

    const blob = await response.blob();
    const fileData = await blob.arrayBuffer();

    const base64Data = Buffer.from(fileData).toString('base64');

    const uploadResult = await cloudinary.uploader.upload(`data:image/png;base64,${base64Data}`, {
        public_id: `generated_image_${uuidv4()}`,
        folder: "generated_images"
    });

    const imageUrl = uploadResult.secure_url;
    return imageUrl;
}

app.post('/api/genimg', async (req, res) => {
    try {
        const { objectName } = req.body;

        if (!objectName) {
            return res.status(400).json({ error: 'objectName is required' });
        }

        const prompts = generatePrompts(objectName);

        const imageUrls = await Promise.all(prompts.map(async (textPrompt) => {
            const imageUrl = await generateImage(textPrompt);
            return imageUrl;
        }));

        res.status(200).json({ imageUrls });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
