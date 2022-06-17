


import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import createConnection from  "../../../../database";
import {  app } from "../../../../app";


let connection: Connection;

describe("Get Balance", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash("admin", 8);
    const id = uuid();


    await connection.query(`
      INSERT INTO USERS(id, name, password, email, created_at)
      values ('${id}', 'admin', '${password}', 'admin@finapi.com.br', 'now()')
    `);

    const deposit_id = uuid();
    const withdraw_id = uuid();

    await connection.query(`
      INSERT INTO STATEMENTS(id, user_id, description, amount, type, created_at, updated_at)
      values ('${deposit_id}', '${id}', 'Deposit', 200, 'deposit', 'now()', 'now()')
    `);

    await connection.query(`
      INSERT INTO STATEMENTS(id, user_id, description, amount, type, created_at, updated_at)
      values ('${withdraw_id}', '${id}', 'Withdraw', 150, 'withdraw', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to list all deposit and withdraw operations and a balance property", async() => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      })


    expect(response.status).toBe(200);
    expect(response.body.statement.length).toEqual(2);
    expect(response.body).toHaveProperty("balance");
    expect(response.body.balance).toEqual(50);
  });

  it("should be not able to list deposit and withdraw operations without an user authenticated", async() => {

    const response = await request(app)
      .get("/api/v1/statements/balance")


    expect(response.status).toBe(401);
  });
})
