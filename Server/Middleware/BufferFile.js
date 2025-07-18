import DataUriParser from "datauri/parser.js";
import path from "path";

export const getDataUri = (file) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname);
  return parser.format(extName, file.buffer);
};
