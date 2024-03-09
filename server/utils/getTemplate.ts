import fs from "fs";
import ejs from "ejs";
import createError from 'http-errors'
import { mailTemplate } from "../configs/mailTemplate.js";

export const getTemplate = (userData) => {
  const htmlEmail = ejs.render(mailTemplate, userData);

  return htmlEmail
};