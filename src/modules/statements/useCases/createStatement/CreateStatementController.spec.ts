


import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import createConnection from  "../../../../database";
import {  app } from "../../../../app";


let connection: Connection;

describe("Create Statement", () => {

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

  it("should be able to create a statement of withdraw", async() => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit"
      })
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toEqual(100);
    expect(response.body.type).toEqual("deposit");
  });


  it("should be able to create a statement of deposit", async() => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "Withdraw"
      })
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toEqual(50);
    expect(response.body.type).toEqual("withdraw");
  });

  it("should be not able to create a withdraw statement with insufficient funds", async() => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 300,
        description: "Withdraw"
      })
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(response.status).toBe(400);
  });

  it("should be not able to create a statement without an user authenticated", async() => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 300,
        description: "Withdraw"
      })

    expect(response.status).toBe(401);
  });
})
