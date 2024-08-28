import { body } from "express-validator";

export const postMeasureValidation = () => {
  return [
    body("image")
      .isBase64()
      .withMessage("Formato de imagem inválido."),
    body("customer_code")
      .isString()
      .withMessage("Código do cliente deve ser uma string")
      .notEmpty()
      .withMessage("Código do cliente é obrigatório"),
    body("measure_datetime")
      .isISO8601()
      .withMessage("Data de medição é obrigatória"),
    body("measure_type")
      .isString()
      .withMessage("Tipo de medição deve ser uma string")
      .notEmpty()
      .withMessage("Tipo de medição é obrigatório")
      .isIn(["WATER", "GAS"])
      .withMessage('Tipo de medição deve ser WATER ou GAS'),
  ];
};

export const patchConfirmMeasureValidation = () => {
  return [
    body("measure_uuid").isString().withMessage("Informe o uuid da medição."),
    body("confirmed_value")
      .isNumeric()
      .withMessage("Valor de confirmação é obrigatório."),
  ];
};
