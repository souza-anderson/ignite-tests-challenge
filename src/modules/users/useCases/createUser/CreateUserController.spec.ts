


import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import createConnection from  "../../../../database";
import {  app } from "../../../../app";


let connection: Connection;

describe("Create User", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash("admin", 8);
    const id = uuid();


    // connection.query(`
    //   INSERT INTO USERS(id, name, password, email, created_at)
    //   values ('${id}', 'admin', '${password}', 'admin@finapi.com.br', 'now()')
    // `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async() => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "teste",
        email: "teste@email.com",
        password: "123"
      });

    expect(response.status).toBe(201);

  });

  it("should not be able to create a new user with e-mail exists", async() => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "teste",
        email: "teste@email.com",
        password: "123"
      });

    expect(response.status).toBe(400);

  });

})
