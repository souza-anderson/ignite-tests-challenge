import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"


let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authentica User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to authenticate an user", async () => {
    const user = {
      name: "teste",
      email: "teste@teste.com",
      password: "123"
    }

    await createUserUseCase.execute({
      name:user.name,
      email: user.email,
      password: user.password
    });

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(authenticatedUser).toHaveProperty("token");
  });

  it("should not be able to authenticate a nonexistent user", async () => {

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "user3@teste.com",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate an user with incorrect password", async () => {

    expect(async () => {
      const user = {
        name: "anderson",
        email: "anderson@teste.com",
        password: "12345"
      }

      await createUserUseCase.execute({
        name:user.name,
        email: user.email,
        password: user.password
      });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "999999"
      });
    }).rejects.toBeInstanceOf(AppError);
  })
})
