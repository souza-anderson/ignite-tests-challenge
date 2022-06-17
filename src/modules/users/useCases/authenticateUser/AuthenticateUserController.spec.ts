


import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import createConnection from  "../../../../database";
import {  app } from "../../../../app";


let connection: Connection;

describe("Authenticate User", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash("admin", 8);
    const id = uuid();

    connection.query(`
      INSERT INTO USERS(id, name, password, email, created_at)
      values ('${id}', 'admin', '${password}', 'admin@finapi.com.br', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async() => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");

  });

  it("should not be able to authenticate a nonexistent user", async() => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "teste@finapi.com.br",
        password: "admin"
      });

    expect(response.status).toBe(401);

  });

  it("should not be able to authenticate an user with incorrect password", async() => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "123456789"
      });


    expect(response.status).toBe(401);

  });

})
