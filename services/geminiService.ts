import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  FileMetadataResponse,
  GoogleAIFileManager,
} from "@google/generative-ai/server";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const fileManager = new GoogleAIFileManager(
  process.env.GEMINI_API_KEY as string
);

if (!fileManager || !genAI) {
  throw new Error("GEMINI_API_KEY não definida no ambiente.");
}

export const uploadImage = async (filePath: string) => {
  try {
    const fileName = path.basename(filePath);
    const mimeType = `image/${path
      .extname(filePath)
      .toLowerCase()
      .substring(1)}`;

    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: fileName,
    });

    return uploadResponse.file;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw error;
  }
};

export const extractMeasureImage = async (file: FileMetadataResponse) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
      {
        text: "Extract the measurement value from this image made up of between 6 and 8 numbers which are separated by dashes.",
      },
    ]);

    return result.response.text();
  } catch (error) {
    console.error("Erro ao extrair medição da imagem:", error);
    throw error;
  }
};
