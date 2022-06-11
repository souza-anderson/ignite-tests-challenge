import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository,
      inMemoryStatementsRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
      createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to return all informations of the operation found", async () => {
    await createUserUseCase.execute({
      email: "user2@test.com",
      name: "test",
      password: "12345"
    });

    const token = await authenticateUserUseCase.execute({
      email: "user2@test.com",
      password: "12345"
    });

    const { id } = token.user;

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: "Deposit test",
      type: "deposit" as any,
      user_id: id as string
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: id as string,
      statement_id: statement.id as string
    });

    expect(statementOperation).toHaveProperty("id");
  });

  it("should be not able to return all informations of a noexistent operation", async () => {
    await createUserUseCase.execute({
      email: "user2@test.com",
      name: "test",
      password: "12345"
    });

    const token = await authenticateUserUseCase.execute({
      email: "user2@test.com",
      password: "12345"
    });

    const { id } = token.user;

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: id as string,
        statement_id: "statement_id"
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should be not able to return all informations of a operation without an user authenticated", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: "user10@test.com",
        name: "test",
        password: "12345"
      });

      const token = await authenticateUserUseCase.execute({
        email: "user10@test.com",
        password: "12345"
      });

      const { id } = token.user;

      const statement = await createStatementUseCase.execute({
        amount: 100,
        description: "Deposit test",
        type: "deposit" as any,
        user_id: id as string
      });

      await getStatementOperationUseCase.execute({
        user_id: "id_test",
        statement_id: statement.id as string
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})
