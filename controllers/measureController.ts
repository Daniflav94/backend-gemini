import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { extractMeasureImage, uploadImage } from "../services/geminiService";

const prisma = new PrismaClient();

const verifyMeasureExistInMonth = async (
  measureType: string,
  customerCode: string,
  measureDate: string
) => {
  const measure = await prisma.measure.findFirst({
    where: { customer_code: customerCode, measure_type: measureType },
  });

  const measureMonth = new Date(measureDate).getMonth();

  if (measure && measure.measure_datetime.getMonth() === measureMonth) {
    return true;
  }
  return false;
};

export const registerMeasure = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const image = (req.file as Express.Multer.File).filename;

    const measure = await verifyMeasureExistInMonth(
      data.measure_type,
      data.customer_code,
      data.measure_datetime
    );

    if (measure) {
      return res.status(409).json({
        error_code: "DOUBLE_REPORT",
        error_description: ["Leitura do mês já realizada"],
      });
    }

    const file = await uploadImage(`uploads/${image}`);

    const textExtracted = await extractMeasureImage(file);

    const newMeasure = await prisma.measure.create({
      data: {
        ...data,
        image_url: file.uri,
        measure_type: data.measure_type.toUpperCase()
      },
    });

    res.status(200).json({
      image_url: file.uri,
      measure_value: textExtracted.match(/\d+/g)?.join(""),
      measure_uuid: newMeasure.measure_uuid,
    });
  } catch (error) {
    console.log(error)
    
    res
      .status(400)
      .json({ error_code: "INVALID_DATA", error_description: error });
  }
};

export const confirmMeasure = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const uuidMeasure = data.measure_uuid;

    const measure = await prisma.measure.findUnique({
      where: { measure_uuid: uuidMeasure },
    });

    if (!measure) {
      return res.status(404).json({
        error_code: "INVALID_DATA",
        error_description: "Leitura não encontrada",
      });
    }

    if (measure.has_confirmed) {
      return res.status(409).json({
        error_code: "CONFIRMATION_DUPLICATE",
        error_description: "Leitura do mês já realizada",
      });
    }

    await prisma.measure.update({
      where: { measure_uuid: uuidMeasure },
      data: {
        measure_value: data.confirmed_value,
        has_confirmed: true,
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res
      .status(400)
      .json({ error_code: "INVALID_DATA", error_description: error });
  }
};

export const listByCustomerCode = async (req: Request, res: Response) => {
  const codeCustomer = req.params.customer_code;
  const query = req.query.measure_type as string | undefined;
  const normalizedQuery = query ? query.toUpperCase() : undefined;
  
  const listMeasures = await prisma.measure.findMany({
    where: { customer_code: codeCustomer, measure_type: normalizedQuery },
  });
  
  if (normalizedQuery && (normalizedQuery !== "WATER" && normalizedQuery !== "GAS")) {
    return res.status(400).json({
      error_code: "INVALID_TYPE",
      error_description: "Tipo de medição não permitida",
    });
  }

  if (listMeasures.length == 0) {
    return res.status(404).json({
      error_code: "MEASURES_NOT_FOUND",
      error_description: "Nenhuma leitura encontrada",
    });
  }

  const measuresWithoutCustomerCode = listMeasures.map(({ customer_code, ...rest }) => rest);

  res.status(200).json({ customer_code: codeCustomer, measures: measuresWithoutCustomerCode });
};
