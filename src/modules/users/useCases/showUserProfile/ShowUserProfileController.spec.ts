


import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import createConnection from  "../../../../database";
import {  app } from "../../../../app";


let connection: Connection;

describe("Show User Profile", () => {

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

  it("should be able to show informations of the authenticated user", async() => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const response = await request(app)
    .get("/api/v1/profile")
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toEqual("admin@finapi.com.br");
  });

  it("should be not able to show informations of an noexistent user", async() => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "usertest@finapi.com.br",
        password: "admin"
      });


    expect(response.status).toBe(401);
  });



})
