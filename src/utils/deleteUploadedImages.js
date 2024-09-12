import path from 'path';
import fs from "fs";


export const delteUploadedImages = async (uploadedFiles) => {
    for (const file of uploadedFiles) {
        const filePath = path.join('uploads', file.filename);
        try {
            await fs.promises.unlink(filePath);
            console.error('Image deleted :', filePath);
        } catch (err) {
            console.error('Error deleting uploaded image:', err);
        }
    }
}