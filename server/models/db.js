import { Sequelize } from "sequelize";
import 'dotenv/config'


//get all info about db
const DBName = process.env.DB_NAME;
const DBUser = process.env.DB_USER;
const DBPassword = process.env.DB_PASSWORD;
const DBHost = process.env.DB_HOST;
const DBPort = process.env.DB_PORT;


//Connect db
export const pool = new Sequelize(DBName, DBUser, DBPassword, {
    dialect: 'postgres',
    host: DBHost,
    port: DBPort,
})