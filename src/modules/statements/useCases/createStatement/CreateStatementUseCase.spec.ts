import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Create Statement", () => {

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository,
      inMemoryStatementsRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  });

  it("should be able to create a statement of deposit", async () => {
    await createUserUseCase.execute({
      email: "user@test.com",
      name: "test",
      password: "12345"
    });

    const token = await authenticateUserUseCase.execute({
      email: "user@test.com",
      password: "12345"
    });

    const { id } = token.user;

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: "Deposit test",
      type: "deposit" as any,
      user_id: id as string
    });

    expect(statement).toHaveProperty("id");
  });


  it("should be able to create a statement of withdraw", async () => {
    await createUserUseCase.execute({
      email: "user@test.com",
      name: "test",
      password: "12345"
    });

    const token = await authenticateUserUseCase.execute({
      email: "user@test.com",
      password: "12345"
    });

    const { id } = token.user;

    await createStatementUseCase.execute({
      amount: 100,
      description: "Deposit test",
      type: "deposit" as any,
      user_id: id as string
    });

    const statement = await createStatementUseCase.execute({
      amount: 50,
      description: "Withdraw test",
      type: "withdraw" as any,
      user_id: id as string
    });


    expect(statement).toHaveProperty("id");
  });

  it("should be not able to create a statement with insufficient funds", async () => {
    await createUserUseCase.execute({
      email: "user@test.com",
      name: "test",
      password: "12345"
    });

    const token = await authenticateUserUseCase.execute({
      email: "user@test.com",
      password: "12345"
    });

    const { id } = token.user;

    expect(async () => {
      await createStatementUseCase.execute({
        amount: 50,
        description: "Withdraw test",
        type: "withdraw" as any,
        user_id: id as string
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should be not able to create a statement without an user authenticated", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 50,
        description: "Deposit test",
        type: "deposit" as any,
        user_id: "id_teste"
      });
    }).rejects.toBeInstanceOf(AppError);
  });

})
