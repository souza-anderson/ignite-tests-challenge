import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { ITransferStatementDTO } from "./ITransferStatementDTO";
import { TransferStatementError } from "./TransferStatementError";


@injectable()
class TransferStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ amount, description, sender_id, receiver_id }: ITransferStatementDTO) {
    const sender_user = await this.usersRepository.findById(sender_id);

    if(!sender_user) {
      throw new CreateStatementError.UserNotFound();
    }

    const receiver_user = await this.usersRepository.findById(receiver_id);

    if(!receiver_user) {
      throw new CreateStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository
      .getUserBalance({ user_id: sender_id })

    if (balance < amount) {
      throw new TransferStatementError.SenderInsufficientFunds();
    }

    const statmentOperation = await this.statementsRepository.create({
      amount,
      description,
      type: 'transfer' as any,
      user_id: sender_id
    });

    await this.statementsRepository.create({
      amount,
      description,
      type: 'transfer' as any,
      user_id: receiver_id
    });

    return statmentOperation;
  }

}

export { TransferStatementUseCase }
