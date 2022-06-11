import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Show User Profile", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to show informations of the authenticated user", async () => {
    const user = {
      name: "user_authenticated",
      email: "testeuser_authenticated@teste.com",
      password: "123"
    };

    await createUserUseCase.execute({
      email: user.email,
      name: user.name,
      password: user.password
    });

    const token = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    const { id } = token.user;

    const userProfile = await showUserProfileUseCase.execute(id as string);
    expect(userProfile).toHaveProperty("id");
    expect(user.name).toEqual("user_authenticated");
  });

  it("should be not able to show informations of an noexistent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("id_teste");
    }).rejects.toBeInstanceOf(AppError);
  });
})
