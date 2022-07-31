import { AppError } from "../../../../shared/errors/AppError";


export namespace TransferStatementError {

  export class SenderInsufficientFunds extends AppError {
    constructor() {
      super('Sender Insufficient Funds', 400)
    }
  }

}
