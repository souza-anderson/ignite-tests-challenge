import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;


describe("Get Balance", () => {

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository,
      inMemoryStatementsRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to list all deposit and withdraw operations and a balance property", async() => {
    await createUserUseCase.execute({
      email: "user5@test.com",
      name: "test",
      password: "12345"
    });

    const token = await authenticateUserUseCase.execute({
      email: "user5@test.com",
      password: "12345"
    });

    const { id } = token.user;

    await createStatementUseCase.execute({
      amount: 100,
      description: "Deposit test",
      type: "deposit" as any,
      user_id: id as string
    });

    await createStatementUseCase.execute({
      amount: 50,
      description: "Withdraw test",
      type: "withdraw" as any,
      user_id: id as string
    });

    const result = await getBalanceUseCase.execute({
      user_id: id as string
    });

    expect(result).toHaveProperty("balance");
    expect(result.statement.length).toBe(2);

  });

  it("should be not able to list deposit and withdraw operations without an user authenticated", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "id_test" });
    }).rejects.toBeInstanceOf(AppError);
  });

})
