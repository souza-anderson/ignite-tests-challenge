import { Request, Response } from "express";
import { container } from "tsyringe";
import { TransferStatementUseCase } from "./TransferStatementUseCase";


class TransferStatementController {
  async execute(request: Request, response: Response): Promise<Response> {
    const transferStatementUseCase = container.resolve(TransferStatementUseCase);
    const { amount, description } = request.body;
    const { user_id: receiver_id } = request.params;
    const { id: sender_id } = request.user;


    const statementOperation = await transferStatementUseCase.execute({
      amount,
      description,
      receiver_id,
      sender_id
    });

    return response.status(201).json(statementOperation);
  }
}

export { TransferStatementController }
