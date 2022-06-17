


import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import createConnection from  "../../../../database";
import {  app } from "../../../../app";


let connection: Connection;

describe("Get Statement Operation", () => {
  const deposit_id = uuid();
  const withdraw_id = uuid();

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash("admin", 8);
    const id = uuid();


    await connection.query(`
      INSERT INTO USERS(id, name, password, email, created_at)
      values ('${id}', 'admin', '${password}', 'admin@finapi.com.br', 'now()')
    `);



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

  it("should be able to return all informations of the operation found", async() => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .get(`/api/v1/statements/${deposit_id}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body.amount).toEqual("200.00");
  });

  it("should be not able to return all informations of a noexistent operation", async() => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/3860c9fe-af85-486f-a700-32c35a559224")
      .set({
        Authorization: `Bearer ${token}`
      });

    console.log(response.body);

    expect(response.status).toBe(404);
  });

  it("should be not able to return all informations of a operation without an user authenticated", async() => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user_test@finapi.com.br",
        password: "admin"
      });

    expect(responseToken.status).toBe(401);
  });
})
